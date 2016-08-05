import { EventEmitter } from 'events';
import { TimeoutError, MessageParseError, ConstellationError } from './errors';
import * as pako from 'pako';

export class ConstellationSocket extends EventEmitter {
    public static WebSocket: typeof WebSocket = typeof WebSocket === 'undefined' ? null : WebSocket;
    public static Promise: typeof Promise = typeof Promise === 'undefined' ? null : Promise;

    public static GZIP_THRESHOLD = 1024;
    public static DEFAULTS = Object.freeze({
        url: 'wss://constellation.beam.pro',
        gzip: true,
        replyTimeout: 10000, // 10 seconds
    });

    public ready = false;

    private socket: WebSocket;
    private messageId: number = 0;
    private queue: any[] = [];

    constructor(public options: SocketOptions = {}) {
        super();

        options = Object.assign({}, ConstellationSocket.DEFAULTS, options);
        options.protocol = options.protocol || options.gzip ? 'cnstl-gzip' : null;

        this.socket = new ConstellationSocket.WebSocket(options.url, options.protocol);

        this.rebroadcastEvent('open');
        this.rebroadcastEvent('close');
        this.rebroadcastEvent('message');
        this.rebroadcastEvent('error');

        this.on('message', res => this.extractMessage(res));
        this.once('event:hello', () => {
            this.ready = true;
            this.queue.forEach(data => this.send(data));
            this.queue = [];
        });
    }

    public static shouldGzip(packet: string): boolean {
        return packet.length > this.GZIP_THRESHOLD;
    }

    /**
     * Send a method to the server.
     */
    public execute(method: ConstellationMethod, params: StringMap<any> = {}, id: number = this.nextId()) {
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

    public sendJson(object: StringMap<any>) {
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
    url?: string;
    gzip?: boolean;
    protocol?: string;
    replyTimeout?: number;
}