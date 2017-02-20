import { EventEmitter } from 'events';
import * as querystring from 'querystring';

import { CancelledError, MessageParseError } from '../errors';
import { IRawValues } from '../interfaces';
import { resolveOn } from '../util';
import { Method, Packet, PacketState, Reply } from './packets';
import { ExponentialReconnectionPolicy, IReconnectionPolicy } from './reconnection';

//We don't support lz4 due to time constraints right now
export type CompressionScheme = 'none' | 'gzip';

/**
 * SocketOptions are passed to the Interactive Socket and control behaviour.
 */
export interface ISocketOptions {
    // Settings to use for reconnecting automatically to Constellation.
    // Defaults to automatically reconnecting with the ExponentialPolicy.
    reconnectionPolicy?: IReconnectionPolicy;
    autoReconnect?: boolean;

    // Websocket URL to connect to, defaults to <TODO>
    url?: string;

    //compression scheme, defaults to none, Will remain none until pako typings are updated
    compressionScheme?: CompressionScheme;

    // Optional JSON web token to use for authentication.
    jwt?: string;

    // Query params to add
    queryParams?: IRawValues;

    // Optional OAuth token to use for authentication.
    authToken?: string;

    // Timeout on Constellation method calls before we throw an error.
    replyTimeout?: number;

    // Duration upon which to send a ping to the server. Defaults to 10 seconds.
    pingInterval?: number;
    // Any extra headers to include in the socket connection.
    extraHeaders?: IRawValues;
}

export interface IWebSocketOptions {
    headers: IRawValues;
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

function getDefaults(): ISocketOptions {
    return {
        url: 'wss://constellation.beam.pro',
        replyTimeout: 10000,
        compressionScheme: 'none',
        autoReconnect: true,
        reconnectionPolicy: new ExponentialReconnectionPolicy(),
        pingInterval: 10 * 1000,
        extraHeaders: {},
        queryParams: {},
    };
}

export class InteractiveSocket extends EventEmitter {
    // WebSocket constructor, may be overridden if the environment
    // does not natively support it.

    //tslint:disable-next-line:variable-name
    public static WebSocket: any = typeof WebSocket === 'undefined' ? null : WebSocket;

    private reconnectTimeout: NodeJS.Timer;
    private options: ISocketOptions;
    private state: State;
    private socket: any;
    private queue: Set<Packet> = new Set<Packet>();

    constructor(options: ISocketOptions = {}) {
        super();
        this.setMaxListeners(Infinity);
        this.setOptions(options);

        if (InteractiveSocket.WebSocket === undefined) {
            throw new Error('Cannot find a websocket implementation; please provide one by ' +
                'running InteractiveSocket.WebSocket = myWebSocketModule;');
        }

        this.on('message', (msg: any) => {
            this.extractMessage(msg);
        });

        this.on('open', () => {
            this.options.reconnectionPolicy.reset();
            this.state = State.Connected;
            this.queue.forEach(data => this.send(data));
        });

        this.on('close', () => {
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

            this.reconnectTimeout = setTimeout(
                () => {
                    this.connect();
                },
                this.options.reconnectionPolicy.next(),
            );
        });
    }



    /**
     * Set the given options.
     * Defaults and previous option values will be used if not supplied.
     */
    public setOptions(options: ISocketOptions) {
        this.options = Object.assign({}, this.options || getDefaults(), options);
        //TODO: Clear up auth here later
        if (this.options.jwt && this.options.authToken) {
            throw new Error('Cannot connect to Constellation with both JWT and OAuth token.');
        }
    }

    /**
     * Open a new socket connection. By default, the socket will auto
     * connect when creating a new instance.
     */
    public connect(): InteractiveSocket {
        if (this.state === State.Closing) {
            this.state = State.Refreshing;
            return this;
        }
        const defaultHeaders = {
            'X-Protocol-Version': '2.0',
        };

        const headers = Object.assign({}, defaultHeaders, this.options.extraHeaders);

        const extras: IWebSocketOptions = {
            headers,
        };

        let url = this.options.url;
        if (this.options.authToken) {
            extras.headers['Authorization'] = `Bearer ${this.options.authToken}`;
        } else if (this.options.jwt) {
            const queryString = Object.assign({}, { Authorization: `JWT ${this.options.jwt}` }, this.options.queryParams);
            url += '?' + querystring.stringify(queryString);
        }
        console.log(url, extras);
        this.socket = new InteractiveSocket.WebSocket(url, null, extras);

        this.state = State.Connecting;

        this.socket.addEventListener('close', (evt: any) => this.emit('close', evt));
        this.socket.addEventListener('open', () => this.emit('open'));
        this.socket.addEventListener('message', (evt: any) => this.emit('message', evt.data));

        this.socket.addEventListener('error', (err: any) => {
            if (this.state === State.Closing) {
                // Ignore errors on a closing socket.
                return;
            }

            this.emit('error', err);
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
    public execute(method: string, params: IRawValues = {}, discard: boolean = false): Promise<any> {
        const methodObj = new Method(method, params, discard);
        return this.send(new Packet(methodObj));
    }

    /**
     * Send emits a Method over the websocket, wrapped in a Packet to provide queueing and
     * cancelation. It returns a promise which resolves with the reply payload from the Server.
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
                .then(() => {
                    throw new CancelledError();
                }),
            ]);
        }

        const timeout = packet.getTimeout(this.options.replyTimeout);
        const promise = Promise.race([
            // Wait for replies to that packet ID:
            resolveOn(this, `reply:${packet.id()}`, timeout)
            .then((result: Reply) => {
                this.queue.delete(packet);

                if (result.error) {
                    throw result.error;
                }

                return result.result;
            })
            .catch(err => {
                this.queue.delete(packet);
                throw err;
            }),
            // Never resolve if the consumer cancels the packets:
            resolveOn(packet, 'cancel', timeout + 1)
            .then(() => {
                throw new CancelledError();
            }),
            // Re-queue packets if the socket closes:
            resolveOn(this, 'close', timeout + 1)
            .then(() => {
                if (!this.queue.has(packet)) { // skip if we already resolved
                    return null;
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

    public reply(reply: Reply) {
        this.sendRaw(reply);
    }

    private sendPacketInner(packet: Packet) {
        this.sendRaw(packet);
    }

    private sendRaw(packet: any) {
        const data = JSON.stringify(packet);
        const payload = data;

        this.emit('send', payload);
        this.socket.send(payload);
    }

    private extractMessage(packet: string | Buffer) {
        let messageString: string;
        messageString = <string> packet;
        let message: any;
        try {
            message = JSON.parse(messageString);
        } catch (err) {
            throw new MessageParseError('Message returned was not valid JSON');
        }

        switch (message.type) {
        case 'method':
            this.emit('method', Method.fromSocket(message));
            break;
        case 'reply':
            this.emit(`reply:${message.id}`, Reply.fromSocket(message));
            break;
        default:
            throw new MessageParseError(`Unknown message type "${message.type}"`);
        }
    }

    public getQueueSize(): number {
        return this.queue.size;
    }
}
