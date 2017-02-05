import { getHeapStatistics } from 'v8';
import { EventEmitter } from 'events';

import { ClockSync } from './ClockSync';
import { InteractiveError } from './errors';
import { MethodHandlerManager } from './methodhandler';
import { Method, Reply } from './packets';
import { CompressionScheme, InteractiveSocket, ISocketOptions } from './socket';
import { only } from './util';

export class Client extends EventEmitter {
    public ready = false;
    public delta: number = 0;
    public clockSyncer = new ClockSync();
    public methodHandler = new MethodHandlerManager();
    /**
     * Set the websocket implementation.
     * You will likely not need to set this in a browser environment.
     * You will not need to set this if WebSocket is globally available.
     *
     * @example
     * client.WebSocket = require('ws');
     */
    public static set WebSocket(ws: any) {
        InteractiveSocket.WebSocket = ws;
    }

    public static get WebSocket() {
        return InteractiveSocket.WebSocket;
    }

    public socket: InteractiveSocket;

    constructor(options: ISocketOptions = {}) {
        super();
        this.socket = new InteractiveSocket(options);

        this.socket.on('method', (method: Method<any>) => {
            this.methodHandler
                .handle(method)
                .then(reply => {
                    if (reply) {
                        this.socket.reply(reply);
                    }
                })
                .catch(only(InteractiveError.Base, err => {
                    /**
                     * Catch only InteractiveError's and send them up to the server.
                     * Other errors indicate a programming issue.
                     */
                    this.socket.reply(Reply.fromError(method.id, err));
                }));
        });
        // This is mostly to demonstrate how the methodHandler could work
        this.methodHandler.addHandler('onReady', readyMethod => {
            this.ready = readyMethod.params.isReady;

            this.emit('ready', this.ready);
            return Promise.resolve(null);
        });

        //Setup syncer
        this.socket.on('open', () => this.clockSyncer.start(() => this.getTime()));
        this.socket.on('close', () => this.clockSyncer.stop());
        this.clockSyncer.on('delta', (delta: number) => this.delta = delta);
    }

    /**
     * Sets the given options on the socket.
     */
    public setOptions(options: ISocketOptions) {
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

    //TODO: Actually implement compression
    public setCompression(preferences: CompressionScheme[]): Promise<void> {
        return this.socket.execute('setCompression', {
            params: preferences,
        }).then(res => {
            this.socket.setOptions({compressionScheme: <CompressionScheme> res.scheme});
        });
    }

    public getTime(): Promise<number> {
        return this.socket.execute('getTime')
            .then(res => res.time);
    }
}
