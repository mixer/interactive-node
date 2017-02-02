import { CompressionScheme, ConstellationSocket, SocketOptions } from './socket';

export enum InteractiveState {
    Idle = 1,
    Ready = 2
}

export class Client {
    /**
     * Set the websocket implementation.
     * You will likely not need to set this in a browser environment.
     * You will not need to set this if WebSocket is globally available.
     *
     * @example
     * Carina.WebSocket = require('ws');
     */
    public static set WebSocket(ws: any) {
        console.log('bloop');
        ConstellationSocket.WebSocket = ws;
    }

    public static get WebSocket() {
        return ConstellationSocket.WebSocket;
    }

    public socket: ConstellationSocket;

    private waiting: { [key: string]: Promise<any> } = {};

    constructor(options: SocketOptions = {}) {
        this.socket = new ConstellationSocket(options);
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
}
