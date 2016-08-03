import { EventEmitter } from 'events';
import { TimeoutError, MessageParseError, ConstellationError } from './errors';

export class ConstellationSocket extends EventEmitter {
    public static WebSocket: typeof WebSocket = typeof WebSocket === 'undefined' ? null : WebSocket;
    public static Promise: typeof Promise = typeof Promise === 'undefined' ? null : Promise;

    public static CONSTELLATION_URL = 'wss://constellation.beam.pro';
    public static REPLY_TIMEOUT = 10000; // 10 seconds

    public ready = false;

    private socket: WebSocket;
    private messageId: number = 0;
    private queue: any[] = [];

    constructor() {
        super();

        this.socket = new ConstellationSocket.WebSocket(ConstellationSocket.CONSTELLATION_URL);

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
            }, ConstellationSocket.REPLY_TIMEOUT);

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
        this.send(JSON.stringify(object));
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

    private extractMessage (messageString: string) {
        var message;

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