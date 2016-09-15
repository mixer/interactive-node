import { ConstellationSocket, SocketOptions } from './socket';

export class Carina {
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
    private subscriptions: string[] = [];

    constructor(options: SocketOptions = {}) {
        this.socket = new ConstellationSocket(options);

        // Resub to live events on reconnect.
        this.socket.on('open', () => {
            if (this.subscriptions.length > 0) {
                this.socket.execute(
                    'livesubscribe',
                    { events: this.subscriptions }
                );
            }
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
    public open(): Carina {
        this.socket.connect();
        return this;
    }

    /**
     * Frees resources associated with the Constellation connection.
     */
    public close() {
        this.socket.close();
    }

    /**
     * @callback onSubscriptionCb
     * @param {Object} data - The payload for the update.
     */

    /**
     * Subscribe to a live event
     *
     * @param {string} slug
     * @param {onSubscriptionCb} cb - Called each time we receive an event for this slug.
     * @returns {Promise.<>} Resolves once subscribed. Any errors will reject.
     */
    public subscribe<T>(slug: string, cb: (data: T) => void): Promise<any> {
        this.socket.on('event:live', (data: { channel: string, payload: any }) => {
            if (data.channel === slug) {
                cb(data.payload);
            }
        });

        return this
        .waitFor(`subscription:${slug}`, () => {
            return this.socket.execute('livesubscribe', { events: [slug] })
            .then(res => {
                this.subscriptions.push(slug);
                return res;
            });
        })
        .catch(err => {
            this.stopWaiting(`subscription:${slug}`);
            throw err;
        });
    }

    /**
     * Unsubscribe from a live event.
     *
     * @param {string} slug
     * @returns {Promise.<>} Resolves once unsubscribed. Any errors will reject.
     */
    public unsubscribe(slug: string) {
        this.stopWaiting(`subscription:${slug}`);
        return this.socket.execute('liveunsubscribe', { events: [slug] })
        .then(res => {
            const index = this.subscriptions.indexOf(slug);
            if (index > -1) {
                this.subscriptions.splice(index, 1);
            }
            return res;
        });
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
}
