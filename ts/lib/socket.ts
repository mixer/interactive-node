import * as pako from 'pako';
import { EventEmitter } from 'events';
import { TimeoutError, MessageParseError, ConstellationError } from './errors';
import { ReconnectionPolicy } from './reconnection';

export class ConstellationSocket extends EventEmitter {
    public static WebSocket: any = typeof WebSocket === 'undefined' ? null : WebSocket;
    public static Promise: typeof Promise = typeof Promise === 'undefined' ? null : Promise;

    public static IS_BOT_HEADER = 'x-is-bot';
    public static GZIP_THRESHOLD = 1024;
    public static DEFAULTS = {
        url: 'wss://constellation.beam.pro',
        gzip: true,
        replyTimeout: 10000, // 10 seconds
        isBot: false,
        autoConnect: true,
        autoReconnect: true,
        reconnectionPolicy: new ReconnectionPolicy(),
    };

    public ready = false;
    public options: SocketOptions = Object.assign({}, ConstellationSocket.DEFAULTS);
    public forceClose: boolean = false;
    public reconnecting: boolean = false;

    private socket: WebSocket;
    private messageId: number = 0;
    private queue: any[] = [];

    constructor(options: SocketOptions = {}) {
        super();

        this.setMaxListeners(Infinity);

        this.on('message', res => this.extractMessage(res));

        if (options.autoConnect !== false) {
            this.connect(options);
        }
    }

    public static shouldGzip(packet: string): boolean {
        return packet.length > this.GZIP_THRESHOLD;
    }

    /**
     * Open a new socket connection.
     * By default, the socket will auto connect when creating a new instance. 
     */
    public connect(options: SocketOptions = {}) {
        Object.assign(this.options, options);
        this.ready = false;

        var url = this.options.url;
        var protocol = this.options.protocol || this.options.gzip ? 'cnstl-gzip' : '';
        var extras = { headers: {} };

        if (this.options.isBot) {
            extras.headers[ConstellationSocket.IS_BOT_HEADER] = true;
        }

        if (this.options.authToken) {
            extras.headers['Authorization'] = `Bearer ${this.options.authToken}`;
        }

        if (this.options.jwt) {
            url += `?jwt=${this.options.jwt}`;
        }

        this.socket = new ConstellationSocket.WebSocket(
            url,
            protocol, 
            extras
        );

        this.rebroadcastEvent('open');
        this.rebroadcastEvent('close');
        this.rebroadcastEvent('message');
        this.rebroadcastEvent('error');

        this.on('event:hello', () => {
            this.ready = true;
            if (this.reconnecting) {
                this.reconnecting = false;
                this.options.reconnectionPolicy.reset();
                this.emit('reopen');
            }
            this.queue.forEach(data => this.send(data));
            this.queue = [];
        });
        this.on('close', () => {
            this.ready = false;
            if (!this.options.autoReconnect || this.forceClose) {
                return;
            }
            this.reconnecting = true;
            setTimeout(() => {
                this.connect();
            }, this.options.reconnectionPolicy.next());
        });
    }

    public close() {
        this.forceClose = true;
        this.socket.close();
    }

    /**
     * Send a method to the server.
     */
    public execute(method: ConstellationMethod, params: { [key: string]: any } = {}, id: number = this.nextId()) {
        this.sendJson({
            type: 'method',
            method, params, id
        });

        return new ConstellationSocket.Promise((resolve, reject) => {
            let replyListener;
            let timeout = setTimeout(() => {
                this.removeListener(`reply:${id}`, replyListener);
                reject(
                    new TimeoutError(
                        `Timeout waiting for response to ${method}: ${JSON.stringify(params)}`
                    )
                );
            }, this.options.replyTimeout);

            this.once(`reply:${id}`, replyListener = (err, res) => {
                clearTimeout(timeout);

                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    public sendJson(object: { [key: string]: any }) {
        var packet: any = JSON.stringify(object);

        if (ConstellationSocket.shouldGzip(packet)) {
            packet = pako.gzip(packet);
        }

        this.send(packet);
    }

    public send(data: any) {
        // If the socket has not said hello, queue the request.
        if (!this.ready) {
            this.queue.push(data);
            return;
        }

        this.emit('send', data);
        this.socket.send(data);
    }

    private nextId(): number {
        return ++this.messageId;
    }

    private extractMessage (packet: string | Buffer) {
        var message: any;

        var messageString: string;
        // If the packet is binary, then we need to unzip it
        if (typeof packet !== 'string') {
            messageString = <string> <any> pako.ungzip(packet, {to: 'string'});
        } else {
            messageString = packet;
        }

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
        }
    }

    private rebroadcastEvent(name: string) {
        this.socket.addEventListener(name, evt => {
            switch (evt.type) {
            case 'message':
                this.emit(name, (evt as MessageEvent).data);
                break;
            default:
                this.emit(name, evt);
                break;
            }
        })
    }
}

export type ConstellationMethod = 'livesubscribe' | 'liveunsubscribe';

export interface SocketOptions {
    isBot?: boolean;
    autoConnect?: boolean;
    gzip?: boolean;

    autoReconnect?: boolean;
    reconnectionPolicy?: ReconnectionPolicy;

    url?: string;
    protocol?: string;
    jwt?: string;
    authToken?: string;

    replyTimeout?: number;
}
