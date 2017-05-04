import { EventEmitter } from 'events';
import { MethodHandlerManager } from './methods/MethodHandlerManager';
import { IState } from './state/IState';

import { PermissionDeniedError } from './errors';
import { IClient } from './IClient';
import { onReadyParams } from './methods/methodTypes';
import {
    IControl,
    IInput,
    IScene,
    ISceneControlDeletion,
    ISceneData,
    ISceneDataArray,
    ITransactionCapture,
} from './state/interfaces';
import { State } from './state/State';
import { Method, Reply } from './wire/packets';
import {
    CompressionScheme,
    InteractiveSocket,
    ISocketOptions,
    SocketState as InteractiveSocketState,
} from './wire/Socket';

export enum ClientType {
    /**
     * A Participant type is used when the client is participating in the session.
     */
    Participant,
    /**
     * A GameClient type is used when the client is running the interactive session.
     */
    GameClient,
}

export class Client extends EventEmitter implements IClient {
    /**
     * The type this client instance is running as.
     */
    public clientType: ClientType;

    /**
     * The client's state store.
     */
    public state: IState;

    /**
     * The client's socket.
     */
    protected socket: InteractiveSocket;

    private methodHandler = new MethodHandlerManager();

    /**
     * Constructs and sets up a client of the given type.
     */
    constructor(clientType: ClientType) {
        super();
        this.clientType = clientType;
        this.state = new State(clientType);
        this.state.setClient(this);
        this.methodHandler.addHandler('hello', () => {
            this.emit('hello');
        });
    }

    /**
     * Processes a method through the client's method handler.
     */
    public processMethod(method: Method<any>) {
        return this.methodHandler.handle(method);
    }

    /**
     * Creates a socket on the client using the specified options.
     * Use [client.open]{@link Client.open} to open the created socket.
     */
    private createSocket(options: ISocketOptions): void {
        if (this.socket) {
            // GC the old socket
            if (this.socket.getState() !== InteractiveSocketState.Closing) {
                this.socket.close();
            }
            this.socket = null;
        }
        this.socket = new InteractiveSocket(options);
        this.socket.on('method', (method: Method<any>) => {
            // Sometimes the client may also want to handle methods,
            // in these cases, if it replies we value it at a higher
            // priority than anything the state handler has. So we
            // only send that one.
            const clientReply = this.processMethod(method);
            if (clientReply) {
                this.reply(clientReply);
                return;
            }

            // Replying to a method is sometimes optional, here we let the state system
            // process a message and if it wants replies.
            const reply = this.state.processMethod(method);
            if (reply) {
                this.reply(reply);
            }
        });

        this.socket.on('open', () => this.emit('open'));
        this.socket.on('error', (err: Error) => this.emit('error', err));

        // Re-emit these for debugging reasons
        this.socket.on('message', (data: any) => this.emit('message', data));
        this.socket.on('send', (data: any) => this.emit('send', data));
        this.socket.on('close', (data: any) => this.emit('close', data));
    }

    /**
     * Sets the given options on the socket.
     */
    public setOptions(options: ISocketOptions) {
        this.socket.setOptions(options);
    }

    /**
     * Opens the connection to interactive.
     */
    public open(options: ISocketOptions): this {
        this.state.reset();
        this.createSocket(options);
        this.socket.connect();
        return this;
    }

    /**
     * Closes and frees the resources associated with the interactive connection.
     */
    public close() {
        if (this.socket) {
            this.socket.close();
        }
    }

    //TODO: Actually implement compression
    /**
     * Begins a negotiation process between the server and this client,
     * the compression preferences of the client are sent to the server and then
     * the server responds with the chosen compression scheme.
     */
    public setCompression(preferences: CompressionScheme[]): Promise<void> {
        return this.socket.execute('setCompression', {
            params: preferences,
        }).then(res => {
            this.socket.setOptions({compressionScheme: <CompressionScheme> res.scheme});
        });
    }

    /**
     * Sends a given reply to the server.
     */
    public reply(reply: Reply) {
        return this.socket.reply(reply);
    }

    /**
     * Retrieves the scenes stored on the interactive server.
     */
    public getScenes(): Promise<ISceneDataArray> {
        return this.execute('getScenes', null, false);
    }

    /**
     * Retrieves the scenes on the server and hydrates the state store with them.
     */
    public synchronizeScenes(): Promise<IScene[]> {
        return this.getScenes()
            .then(res => this.state.synchronizeScenes(res));
    }

    /**
     * Gets the time from the server as a unix timestamp in UTC.
     */
    public getTime(): Promise<number> {
        return this.execute('getTime', null, false)
            .then(res => {
                return res.time;
            });
    }
    /**
     * `createControls` will instruct the server to create your provided controls in the active,
     * project. Participants will see the new controls as they are added.
     */
    public execute(method: 'createControls', params: ISceneData, discard: false ): Promise<ISceneData>;
    /**
     * `ready` allows you to indicate to the server the ready state of your GameClient.
     * By specifying `isReady` false you can pause participant interaction whilst you
     * setup scenes and controls.
     */
    public execute(method: 'ready', params: onReadyParams, discard: false ): Promise<void>;
    /**
     * `capture` is used to capture a spark transaction that you have received from the server.
     */
    public execute(method: 'capture', params: ITransactionCapture, discard: false ): Promise<void>;
    /**
     * `getTime` retrieves the server's unix timestamp. You can use this to synchronize your clock with
     * the servers. See [ClockSync]{@link ClockSync} for a Clock Synchronizer.
     */
    public execute(method: 'getTime', params: null, discard: false ): Promise<{time: number}>;
    /**
     * `getScenes` retrieves scenes stored ont he server. If you've used the studio to create your project,
     * then you can use this to retrieve the scenes and controls created there.
     */
    public execute(method: 'getScenes', params: null, discard: false ): Promise<ISceneDataArray>;
    /**
     * `giveInput` is used to send participant interactive events to the server.
     * These events will be received by the corresponding GameClient.
     */
    public execute<K extends IInput>(method: 'giveInput', params: K, discard: false): Promise<void>;
    /**
     * `updateControls` is used to update control properties within a scene, such as disabling a control.
     */
    public execute(method: 'updateControls', params: ISceneData, discard: false): Promise<void>;
    /**
     * `deleteControls` will delete the specified controls from the server. Participants will see these controls
     * vanish and will not be able to interact with them.
     */
    public execute(method: 'deleteControls', params: ISceneControlDeletion, discard: false): Promise<void>;
    public execute<T>(method: string, params: T, discard: boolean): Promise<any>;
    /**
     * Execute will construct and send a method to the server for execution.
     * It will resolve with the server's reply. It is recommended that you use an
     * existing Client method if available instead of manually calling `execute`.
     */
    public execute(method: string, params: any, discard: boolean): Promise<any> {
        return this.socket.execute(method, params, discard);
    }

    public createControls(_: ISceneData): Promise<IControl[]> {
        throw new PermissionDeniedError('createControls', 'Participant');
    }

    public updateControls(_: ISceneData): Promise<void> {
        throw new PermissionDeniedError('updateControls', 'Participant');
    }

    public updateScenes(_: ISceneDataArray): Promise<void> {
        throw new PermissionDeniedError('updateScenes', 'Participant');
    }

    public giveInput<T extends IInput>(_: T): Promise<void> {
        throw new PermissionDeniedError('giveInput', 'GameClient');
    }

    public deleteControls(_: ISceneControlDeletion): Promise<void> {
        throw new PermissionDeniedError('deleteControls', 'Participant');
    }

    public ready(_: boolean): Promise<void> {
        throw new PermissionDeniedError('ready', 'Participant');
    }
}
