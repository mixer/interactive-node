import { EventEmitter } from 'events';

import { PermissionDeniedError } from './errors';
import { IClient } from './IClient';
import { onReadyParams } from './methods/methodTypes';
import { IInput } from './state/interfaces/controls/IInput';
import { ISceneDataArray } from './state/interfaces/IScene';
import { State } from './state/State';
import { Method, Reply } from './wire/packets';
import { CompressionScheme, InteractiveSocket, ISocketOptions } from './wire/Socket';

const participantMethods = ['giveInput', 'getScenes', 'getTime'];

export enum ClientType {
    Participant,
    GameClient,
}

export interface IClientOptions {
    clientType: ClientType;
    socketOptions: ISocketOptions;
}

export class Client extends EventEmitter implements IClient {
    private clientType: ClientType;
    public isReady: boolean;

    public state = new State();

    private socket: InteractiveSocket;

    constructor(options: IClientOptions) {
        super();
        this.clientType = options.clientType;
        this.state.setClient(this);
        this.socket = new InteractiveSocket(options.socketOptions);
        this.socket.on('method', (method: Method<any>) => {
            // As process method can return a promise or void here,
            // Check it has a value and then wait, or just ignore it
            // if there is no value
            const waitingForReply = this.state.processMethod(method);
            if (waitingForReply) {
                waitingForReply.then(reply => {
                    if (reply) {
                        this.reply(reply);
                    }
                });
            }
        });

        this.socket.on('open', () => {
            // Hydrate the state store with the current state on a connection.
            this.getScenes()
                 .then(res => this.state.initialize(res.scenes));
        });
    }

    /**
     * Sets the given options on the socket.
     */
    public setOptions(options: ISocketOptions) {
        this.socket.setOptions(options);
    }

    /**
     * Boots the connection to interactive
     */
    public open(): Client {
        this.socket.connect();
        return this;
    }

    /**
     * Closes and frees the resources ascociated with the interactive connection.
     */
    public close() {
        this.socket.close();
    }

    //TODO: Actually implement compression
    /**
     * setCompression is a negotiation process between the server and our client,
     * We send the compression we support, and it sends back the agreed compression scheme
     */
    public setCompression(preferences: CompressionScheme[]): Promise<void> {
        return this.socket.execute('setCompression', {
            params: preferences,
        }).then(res => {
            this.socket.setOptions({compressionScheme: <CompressionScheme> res.scheme});
        });
    }

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

    public reply(reply: Reply) {
        return this.socket.reply(reply);
    }

    public getScenes(): Promise<ISceneDataArray> {
        return this.execute('getScenes', null, false);
    }

    public updateControls(params: ISceneDataArray): Promise<void> {
        return this.execute('updateControls', params, false);
    }

    public updateScenes(scenes: ISceneDataArray): Promise<any> {
        return this.execute('updateScenes', scenes, false);
    }

    public ready(isReady: boolean = true): Promise<any> {
        return this.execute('ready', { isReady }, false);
    }

    public getTime(): Promise<number> {
        return this.execute('getTime', null, false)
            .then(res => {
                return res.time;
            });
    }

    public execute(method: 'ready', params: onReadyParams, discard: false ): Promise<void>;
    public execute(method: 'getTime', params: null, discard: false ): Promise<{time: number}>;
    public execute(method: 'getScenes', params: null, discard: false ): Promise<ISceneDataArray>;
    public execute<K extends IInput>(method: 'giveInput', params: K, discard: false): Promise<void>;
    public execute(method: 'updateControls', params: ISceneDataArray, discard: false): Promise<void>;
    public execute<T>(method: string, params: T, discard: boolean): Promise<any>
    public execute(method: string, params: any, discard: boolean): Promise<any> {

        if (this.clientType === ClientType.Participant && !participantMethods.indexOf(method)) {
            throw new PermissionDeniedError(method, 'Participant');
        }

        if (this.clientType === ClientType.GameClient && method === 'giveInput') {
            throw new PermissionDeniedError(method, 'GameClient');
        }

        return this.socket.execute(method, params, discard);
    }

}
