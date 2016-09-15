import { TimeoutError, MessageParseError, ConstellationError, CancelledError } from './errors';
import { ExponentialReconnectionPolicy, ReconnectionPolicy } from './reconnection';
import { EventEmitter } from 'events';
import { Packet, PacketState } from './packets';

import { timeout, resolveOn } from './util';
import * as querystring from 'querystring';
import * as pako from 'pako';

const pkg = require('../package.json');

/**
 * The GzipDetector is used to determine whether packets should be compressed
 * before sending to Constellation.
 */
export interface GzipDetector {
    /**
     * shouldZip returns true if the packet, encoded as a string, should
     * be gzipped before sending to Constellation.
     * @param {string} packet `raw` encoded as a string
     * @param {any}    raw    the JSON-serializable object to be sent
     */
    shouldZip(packet: string, raw: any);
}

/**
 * SizeThresholdGzipDetector is a GzipDetector which zips all packets longer
 * than a certain number of bytes.
 */
export class SizeThresholdGzipDetector implements GzipDetector {
    constructor(private threshold: number) {}

    shouldZip(packet: string, raw: { [key: string]: any }) {
        return packet.length > this.threshold;
    }
}

/**
 * SocketOptions are passed to the
 */
export interface SocketOptions {
    // Whether to announce that the client is a bot in the socket handshake.
    // Note that setting it to `false` may result in a ban. Defaults to true.
    isBot?: boolean;

    // User agent header to advertise in connections.
    userAgent?: string;

    // Settings to use for reconnecting automatically to Constellation.
    // Defaults to automatically reconnecting with the ExponentialPolicy.
    reconnectionPolicy?: ReconnectionPolicy;
    autoReconnect?: boolean;

    // Websocket URL to connect to, defaults to wss://constellation.beam.pro
    url?: string;

    // Interface used to determine whether messages should be gzipped.
    // Defaults to a strategy which gzipps messages greater than 1KB in size.
    gzip?: GzipDetector;

    // Optional JSON web token to use for authentication.
    jwt?: string;
    // Optional OAuth token to use for authentication.
    authToken?: string;

    // Timeout on Constellation method calls before we throw an error.
    replyTimeout?: number;

    // Duration upon which to send a ping to the server. Defaults to 10 seconds.
    pingInterval?: number;
}

/**
 * State is used to record the status of the websocket connection.
 */
export enum State {
    // a connection attempt has not been made yet
    Idle = 1,
    // a connection attempt is currently being made
    Connecting,
    // the socket is connection and data may be sent
    Connected,
    // the socket is gracefully closing; after this it will become Idle
    Closing,
    // the socket is reconnecting after closing unexpectedly
    Reconnecting,
    // connect was called whilst the old socket was still open
    Refreshing,
}

function getDefaults(): SocketOptions {
    return {
        url: 'wss://constellation.beam.pro',
        userAgent: `Carina ${pkg.version}`,
        replyTimeout: 10000,
        isBot: false,
        gzip: new SizeThresholdGzipDetector(1024),
        autoReconnect: true,
        reconnectionPolicy: new ExponentialReconnectionPolicy(),
        pingInterval: 10 * 1000,
    };
}

export class ConstellationSocket extends EventEmitter {
    // WebSocket constructor, may be overridden if the environment
    // does not natively support it.
    public static WebSocket: any = typeof WebSocket === 'undefined' ? null : WebSocket;

    private reconnectTimeout: NodeJS.Timer;
    private pingTimeout: NodeJS.Timer;
    private options: SocketOptions;
    private state: State;
    private socket: WebSocket;
    private queue: Set<Packet> = new Set<Packet>();

    constructor(options: SocketOptions = {}) {
        super();
        this.setMaxListeners(Infinity);
        this.setOptions(options);

        if (ConstellationSocket.WebSocket === undefined) {
            throw new Error('Cannot find a websocket implementation; please provide one by ' +
                'running ConstellationSocket.WebSocket = myWebSocketModule;')
        }

        this.on('message', msg => this.extractMessage(msg.data));
        this.on('open', () => this.schedulePing());

        this.on('event:hello', () => {
            this.options.reconnectionPolicy.reset();
            this.state = State.Connected;
            this.queue.forEach(data => this.send(data));
        });

        this.on('close', err => {
            if (this.state === State.Refreshing) {
                this.state = State.Idle;
                this.connect();
                return;
            }

            if (this.state === State.Closing || !this.options.autoReconnect) {
                this.state = State.Idle;
                return;
            }

            this.state = State.Reconnecting;
            this.reconnectTimeout = setTimeout(() => {
                this.connect();
            }, this.options.reconnectionPolicy.next());
        });
    }

    /**
     * Set the given options.
     * Defaults and previous option values will be used if not supplied.
     */
    setOptions(options: SocketOptions) {
        this.options = Object.assign({}, this.options || getDefaults(), options);

        if (this.options.jwt && this.options.authToken) {
            throw new Error('Cannot connect to Constellation with both JWT and OAuth token.');
        }
    }

    /**
     * Open a new socket connection. By default, the socket will auto
     * connect when creating a new instance.
     */
    public connect(): ConstellationSocket {
        if (this.state === State.Closing) {
            this.state = State.Refreshing;
            return;
        }

        const protocol = this.options.gzip ? 'cnstl-gzip' : 'cnstl';
        const extras = {
            headers: {
                'User-Agent': this.options.userAgent,
                'X-Is-Bot': this.options.isBot,
            },
        };

        let url = this.options.url;
        if (this.options.authToken) {
            extras.headers['Authorization'] = `Bearer ${this.options.authToken}`;
        } else if (this.options.jwt) {
            url += '?' + querystring.stringify({ jwt: this.options.jwt });
        }

        this.socket = new ConstellationSocket.WebSocket(url, protocol, extras);
        this.socket.binaryType = 'arraybuffer';

        this.state = State.Connecting;

        this.rebroadcastEvent('open');
        this.rebroadcastEvent('close');
        this.rebroadcastEvent('message');

        this.socket.addEventListener('error', err => {
            if (this.state === State.Closing) {
                this.emit('close');
            } else {
                this.emit('error', err);
            }
        });

        return this;
    }

    /**
     * Returns the current state of the socket.
     * @return {State}
     */
    public getState(): State {
        return this.state;
    }

    /**
     * Close gracefully shuts down the websocket.
     */
    public close() {
        if (this.state === State.Reconnecting) {
            clearTimeout(this.reconnectTimeout);
            this.state = State.Idle;
            return;
        }

        this.state = State.Closing;
        this.socket.close();

        this.queue.forEach(packet => packet.cancel());
        this.queue.clear();
    }

    /**
     * Executes an RPC method on the server. Returns a promise which resolves
     * after it completes, or after a timeout occurs.
     */
    public execute(method: string, params: { [key: string]: any } = {}): Promise<any> {
        return this.send(new Packet(method, params));
    }

    /**
     * Send emits a packet over the websocket, or queues it for later sending
     * if the socket is not open.
     */
    public send(packet: Packet): Promise<any> {
        if (packet.getState() === PacketState.Cancelled) {
            return Promise.reject(new CancelledError());
        }

        this.queue.add(packet);

        // If the socket has not said hello, queue the request and return
        // the promise eventually emitted when it is sent.
        if (this.state !== State.Connected) {
            return Promise.race([
                resolveOn(packet, 'send'),
                resolveOn(packet, 'cancel')
                .then(() => { throw new CancelledError() }),
            ]);
        }

        const timeout = packet.getTimeout(this.options.replyTimeout);
        const promise = Promise.race([
            // Wait for replies to that packet ID:
            resolveOn(this, `reply:${packet.id()}`, timeout)
            .then((result: { err: Error, result: any }) => {
                this.queue.delete(packet);

                if (result.err) {
                    throw result.err;
                }

                return result.result;
            })
            .catch(err => {
                this.queue.delete(packet);
                throw err;
            }),
            // Never resolve if the consumer cancels the packets:
            resolveOn(packet, 'cancel', timeout + 1)
            .then(() => { throw new CancelledError() }),
            // Re-queue packets if the socket closes:
            resolveOn(this, 'close', timeout + 1)
            .then(() => {
                if (!this.queue.has(packet)) { // skip if we already resolved
                    return;
                }

                packet.setState(PacketState.Pending);
                return this.send(packet);
            }),
        ]);

        packet.emit('send', promise);
        packet.setState(PacketState.Sending);
        this.sendPacketInner(packet);

        return promise;
    }

    private sendPacketInner(packet: Packet) {
        const data = JSON.stringify(packet);
        const payload = this.options.gzip.shouldZip(data, packet.toJSON())
            ? pako.gzip(data)
            : data;

        this.emit('send', payload);
        this.socket.send(payload);
    }

    private extractMessage(packet: string | Buffer) {
        let messageString: string;
        // If the packet is binary, then we need to unzip it
        if (typeof packet !== 'string') {
            messageString = <string> <any> pako.ungzip(packet, { to: 'string' });
        } else {
            messageString = packet;
        }

        let message: any;
        try {
            message = JSON.parse(messageString);
        } catch (err) {
            throw new MessageParseError('Message returned was not valid JSON');
        }

        // Bump the ping timeout whenever we get a message reply.
        this.schedulePing();

        switch (message.type) {
        case 'event':
            this.emit(`event:${message.event}`, message.data);
            break;
        case 'reply':
            let err = message.error ? ConstellationError.from(message.error) : null;
            this.emit(`reply:${message.id}`, { err, result: message.result });
            break;
        default:
            throw new MessageParseError(`Unknown message type "${message.type}"`);
        }
    }

    private rebroadcastEvent(name: string) {
        this.socket.addEventListener(name, evt => this.emit(name, evt));
    }

    private schedulePing() {
        clearTimeout(this.pingTimeout);

        this.pingTimeout = setTimeout(() => {
            if (this.state !== State.Connected) {
                return;
            }

            const packet = new Packet('ping', null);
            const timeout = this.options.replyTimeout;

            setTimeout(() => {
                this.sendPacketInner(packet);
                this.emit('ping');
            });

            return Promise.race([
                resolveOn(this, `reply:${packet.id()}`, timeout),
                resolveOn(this, 'close', timeout + 1),
            ])
            .then(() => this.emit('pong'))
            .catch(err => this.socket.close());
        }, this.options.pingInterval);
    }
}
