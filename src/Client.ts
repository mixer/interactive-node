import { EventEmitter } from 'events';

import { PermissionDeniedError } from './errors';
import { IClient } from './IClient';
import { onReadyParams } from './methods/methodTypes';
import { IInput } from './state/interfaces/controls/IInput';
import { ISceneData, ISceneDataArray } from './state/interfaces/IScene';
import { State } from './state/State';
import { Method, Reply } from './wire/packets';
import { CompressionScheme, InteractiveSocket, ISocketOptions } from './wire/Socket';

export enum ClientType {
    Participant,
    GameClient,
}

export interface IClientOptions {
    clientType: ClientType;
    socketOptions: ISocketOptions;
}

export class Client extends EventEmitter implements IClient {
    public clientType: ClientType;
    public isReady: boolean;

    public state: State;

    protected socket: InteractiveSocket;

    constructor(options: IClientOptions) {
        super();
        this.clientType = options.clientType;
        this.state = new State(this.clientType);
        this.state.setClient(this);
        this.socket = new InteractiveSocket(options.socketOptions);
        this.socket.on('method', (method: Method<any>) => {
            // As process method can return a reply or nothing
            const reply = this.state.processMethod(method);
            if (!reply) {
                return;
            }
            this.reply(reply);
        });

        this.socket.on('open', () => {
            // Hydrate the state store with the current state on a connection.
            this.getScenes()
                 .then(res => this.state.initialize(res.scenes));
        });

        // Re-emit these for debugging reasons
        this.socket.on('message', (data: any) => this.emit('message', data));
        this.socket.on('send', (data: any) => this.emit('send', data));
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

    public reply(reply: Reply) {
        return this.socket.reply(reply);
    }

    public getScenes(): Promise<ISceneDataArray> {
        return this.execute('getScenes', null, false);
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

    public execute(method: 'createControls', params: ISceneData, discard: false ): Promise<ISceneData>;
    public execute(method: 'ready', params: onReadyParams, discard: false ): Promise<void>;
    public execute(method: 'getTime', params: null, discard: false ): Promise<{time: number}>;
    public execute(method: 'getScenes', params: null, discard: false ): Promise<ISceneDataArray>;
    public execute<K extends IInput>(method: 'giveInput', params: K, discard: false): Promise<void>;
    public execute(method: 'updateControls', params: ISceneDataArray, discard: false): Promise<void>;
    public execute<T>(method: string, params: T, discard: boolean): Promise<any>
    public execute(method: string, params: any, discard: boolean): Promise<any> {
        return this.socket.execute(method, params, discard);
    }

    public updateControls(_: ISceneDataArray): Promise<void> {
        throw new PermissionDeniedError('updateControls', 'Participant');
    }

    public updateScenes(_: ISceneDataArray): Promise<void> {
        throw new PermissionDeniedError('updateScenes', 'Participant');
    }

    public giveInput<T extends IInput>(_: T): Promise<void> {
        throw new PermissionDeniedError('giveInput', 'GameClient');
    }

}
