import { onReadyParams } from './methodTypes';
import { ConstellationError } from './errors';
import { EventEmitter } from 'events';
import { MethodHandlerManager } from './methodhandler';
import { Reply } from './packets';
import { CompressionScheme, ConstellationSocket, SocketOptions } from './socket';
import { only } from './util';

export enum InteractiveState {
    Idle = 1,
    Ready = 2
}

export class Client extends EventEmitter {
    public ready = false;
    public methodHandler = new MethodHandlerManager();
    /**
     * Set the websocket implementation.
     * You will likely not need to set this in a browser environment.
     * You will not need to set this if WebSocket is globally available.
     *
     * @example
     * Carina.WebSocket = require('ws');
     */
    public static set WebSocket(ws: any) {
        ConstellationSocket.WebSocket = ws;
    }

    public static get WebSocket() {
        return ConstellationSocket.WebSocket;
    }

    public socket: ConstellationSocket;

    private waiting: { [key: string]: Promise<any> } = {};

    constructor(options: SocketOptions = {}) {
        super();
        this.socket = new ConstellationSocket(options);

        this.socket.on('method', method => {
            this.methodHandler
                .handle(method)
                .then(reply => {
                    if (reply) {
                        this.socket.reply(reply);
                    }
                })
                .catch(only(ConstellationError.Base, err => {
                    this.socket.reply(Reply.fromError(method.id, err));
                }));
        });

        this.methodHandler.addHandler('onReady', readyMethod => {
            const params = <onReadyParams> readyMethod.params;

            this.ready = params.isReady;

            this.emit('ready', this.ready);
            return Promise.resolve(null);
        });

        this.on('ready', ready => {
            if (!ready) return;
            this.getScenes();
        });
    }

    /**
     * Sets the given options on the socket.
     */
    public setOptions(options: SocketOptions) {
        this.socket.setOptions(options);
    }

    /**
     * Boots the connection to constellation.
     */
    public open(): Client {
        this.socket.connect();
        return this;
    }

    /**
     * Frees resources associated with the Constellation connection.
     */
    public close() {
        this.socket.close();
    }

    private waitFor<T>(identifier: string, cb?: () => Promise<T>): Promise<T> {
        if (this.waiting[identifier]) {
            return this.waiting[identifier];
        }

        return this.waiting[identifier] = cb();
    }

    private stopWaiting(identifier: string) {
        delete this.waiting[identifier];
    }

    public setCompression(preferences: CompressionScheme[]): Promise<void> {
        return this.socket.execute('setCompression', {
            params: preferences,
        }).then(res => {
            this.socket.setOptions({compressionScheme: <CompressionScheme> res.scheme});
        }).then(res => undefined);
    }

    public getScenes() {
        this.socket.execute('getScenes',)
    }
}
