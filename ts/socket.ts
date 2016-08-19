import { TimeoutError, MessageParseError, ConstellationError } from './errors';
import { ExponentialReconnectionPolicy, ReconnectionPolicy } from './reconnection';
import { race, timeout, resolveOn } from './util';
import { EventEmitter } from 'events';
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
    autoReconnect?: boolean;
    reconnectionPolicy?: ReconnectionPolicy;

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

    // Whether to automatically connect when the socket is instantiated.
    // Defaults to true.
    autoConnect?: boolean;
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
}

/**
 * The Sendable type indicates data types that can be used in the
 * WebSocket.send method.
 */
type Sendable = string | ArrayBuffer | Blob;

export type ConstellationMethod = 'livesubscribe' | 'liveunsubscribe';

function getDefaults(): SocketOptions {
    return {
        url: 'wss://constellation.beam.pro',
        userAgent: `Carnia ${pkg.version}`,
        replyTimeout: 10000,
        isBot: false,
        gzip: new SizeThresholdGzipDetector(1024),
        autoReconnect: true,
        autoConnect: true,
        reconnectionPolicy: new ExponentialReconnectionPolicy(),
    };
}

export class ConstellationSocket extends EventEmitter {
    // WebSocket constructor, may be overridden if the environment
    // does not natively support it.
    public static WebSocket: any = typeof WebSocket === 'undefined' ? null : WebSocket;

    private options: SocketOptions;
    private reconnectTimeout: NodeJS.Timer;
    private state: State;
    private socket: WebSocket;
    private messageId: number = 0;
    private queue: Sendable[] = [];

    constructor(options: SocketOptions = {}) {
        super();
        this.setMaxListeners(Infinity);

        if (options.jwt && options.authToken) {
            throw new Error('Cannot connect to Constellation with both JWT and OAuth token.');
        }
        if (ConstellationSocket.WebSocket === undefined) {
            throw new Error('Cannot find a websocket implementation; please provide one by ' +
                'running ConstellationSocket.WebSocket = myWebSocketModule;')
        }

        this.options = Object.assign(getDefaults(), options);
        this.on('message', msg => this.extractMessage(msg.data));

        if (options.autoConnect) {
            this.connect();
        }
    }

    /**
     * Open a new socket connection. By default, the socket will auto
     * connect when creating a new instance.
     */
    public connect() {
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
        this.state = State.Connecting;

        this.rebroadcastEvent('open');
        this.rebroadcastEvent('close');
        this.rebroadcastEvent('message');
        this.rebroadcastEvent('error');

        this.on('event:hello', () => {
            if (this.state !== State.Connecting) { // may have been closed just now
                return;
            }

            this.options.reconnectionPolicy.reset();
            this.state = State.Connected;
            this.queue.forEach(data => this.send(data));
            this.queue = [];
        });

        this.on('close', () => {
            if (this.state === State.Closing || !this.options.autoReconnect) {
                this.state = State.Idle;
                return;
            }

            this.state = State.Connecting;
            this.reconnectTimeout = setTimeout(() => {
                this.connect();
            }, this.options.reconnectionPolicy.next());
        });
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
        this.state = State.Closing;
        this.socket.close();
        clearTimeout(this.reconnectTimeout);
    }

    /**
     * Send a method to the server.
     */
    public execute(method: ConstellationMethod, params: { [key: string]: any } = {}): Promise<any> {
        const timeout = this.options.replyTimeout;
        const id = this.nextId();

        this.sendJson({
            id,
            method,
            params,
            type: 'method',
        });

        return race([
            resolveOn(this, `reply:${id}`, timeout),
            resolveOn(this, 'close', timeout + 1)
            .then(() => this.execute(method, params)),
        ]);
    }

    /**
     * Send emits the JSON-serializable object over the socket.
     */
    public sendJson(object: { [key: string]: any }) {
        var packet: any = JSON.stringify(object);

        if (this.options.gzip.shouldZip(packet, object)) {
            packet = pako.gzip(packet);
        }

        this.send(packet);
    }

    /**
     * Returns the next incremented request ID.
     * @return {number}
     */
    private nextId(): number {
        return this.messageId++;
    }

    /**
     * Send is a low-level method to send raw bytes over the weos
     * @param {any} data [description]
     */
    private send(data: Sendable) {
        // If the socket has not said hello, queue the request.
        if (this.state !== State.Connected) {
            this.queue.push(data);
            return;
        }

        this.emit('send', data);
        this.socket.send(data);
    }

    private extractMessage (packet: string | Buffer) {
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

        switch (message.type) {
        case 'event':
            this.emit(`event:${message.event}`, message.data);
            break;
        case 'reply':
            let err = message.error ? ConstellationError.from(message.error) : null;
            this.emit(`reply:${message.id}`, err, message.result);
            break;
        default:
            throw new MessageParseError(`Unknown message type "${message.type}"`);
        }
    }

    private rebroadcastEvent(name: string) {
        this.socket.addEventListener(name, evt => this.emit(name, evt));
    }
}
