import { EventEmitter } from 'events';
import { merge } from 'lodash';

import { ClientType } from '../Client';
import { ClockSync } from '../ClockSync';
import { InteractiveError } from '../errors';
import { IClient } from '../IClient';
import { MethodHandlerManager } from '../methods/MethodHandlerManager';
import { Method, Reply } from '../wire/packets';
import { IParticipant } from './interfaces';
import { IControl } from './interfaces/controls/IControl';
import { ISceneData } from './interfaces/IScene';
import { Scene } from './Scene';
import { StateFactory } from './StateFactory';

export class State extends EventEmitter {
    public groups: any;
    public isReady: boolean;
    private methodHandler = new MethodHandlerManager();
    private stateFactory = new StateFactory();
    private scenes = new Map<string, Scene>();

    private client: IClient;

    private participants = new Map<string, IParticipant>();

    private clockDelta: number = 0;

    private clockSyncer = new ClockSync({
        sampleFunc: () => this.client.getTime(),
    });

    constructor(private clientType: ClientType) {
        super();

        this.methodHandler.addHandler('onReady', readyMethod => {
            this.isReady = readyMethod.params.isReady;
            this.emit('ready', this.isReady);
        });

        // Scene Events
        this.methodHandler.addHandler('onSceneCreate', res => {
            res.params.scenes.forEach(scene => this.addScene(scene));
        });
        this.methodHandler.addHandler('onSceneDelete', res => {
            this.deleteScene(res.params.sceneID, res.params.reassignSceneID);
        });
        this.methodHandler.addHandler('onSceneUpdate', res => {
            res.params.scenes.forEach(scene => this.updateScene(scene));
        });

        this.methodHandler.addHandler('onControlCreate', res => {
            const scene = this.getScene(res.params.sceneID);
            if (scene) {
                scene.addControls(res.params.controls);
            }
        });

        this.methodHandler.addHandler('onControlDelete', res => {
            const scene = this.getScene(res.params.sceneID);
            if (scene) {
                scene.deleteControls(res.params.controls);
            }
        });

        this.methodHandler.addHandler('onControlUpdate', res => {
            res.params.scenes.forEach(sceneData => {
                const scene = this.getScene(sceneData.sceneID);
                if (scene) {
                    scene.updateControls(sceneData.controls);
                }
            });
        });
        this.clockSyncer.on('delta', (delta: number) => {
            // TODO pass delta into state, that involve times. Just buttons right now?
            this.clockDelta = delta;
        });

        // Here we're deciding to discard all participant messages, if this is a participant client
        // I wasn't sure if participants got these events at the time. Checking with Connor.
        // Either way we don't need to store potentially thousands of these records in memory on
        // the Participant side.
        //
        // Only remaining query is how a Participant knows who they are in the loop.
        if (this.clientType !== ClientType.GameClient) {
            return;
        }
        this.methodHandler.addHandler('onParticipantJoin', res => {
            res.params.participants.forEach(participant => {
                this.participants.set(participant.sessionID, participant);
                this.emit('participantJoin', participant);
            });
        });

        this.methodHandler.addHandler('onParticipantLeave', res => {
            res.params.participants.forEach(participant => {
                this.participants.delete(participant.sessionID);
                this.emit('participantLeave', participant.sessionID);
            });
        });

        this.methodHandler.addHandler('onParticipantUpdate', res => {
            res.params.participants.forEach(participant => {
                merge(this.participants.get(participant.sessionID), participant);
            });
        });

        this.methodHandler.addHandler('giveInput', res => {
            const control = this.getControl(res.params.input.controlID);
            if (control) {
                const participant = this.getParticipantBySessionID(res.params.participantID);
                control.receiveInput(res.params, participant);
            }
        });
    }
    public setClient(client: IClient) {
        this.client = client;
        this.stateFactory.setClient(client);
        this.clockSyncer.start();
    }
    public processMethod(method: Method<any>): void | Reply {
        try {
            return this.methodHandler.handle(method);
        } catch (e) {
            if (e instanceof InteractiveError.Base) {
                return Reply.fromError(method.id, e);
            }
            throw e;
        }
    }

    public initialize(scenes: ISceneData[]) {
        scenes.forEach(scene => this.addScene(scene));
    }

    public updateScene(scene: ISceneData) {
        const targetScene = this.getScene(scene.sceneID);
        if (targetScene) {
            targetScene.update(scene);
        }
    }

    public deleteScene(sceneID: string, reassignSceneID: string) {
        const targetScene = this.getScene(sceneID);
        if (targetScene) {
            targetScene.destroy();
            this.scenes.delete(sceneID);
            this.emit('sceneDeleted', sceneID, reassignSceneID);
        }
    }

    public addScene(data: ISceneData): Scene {
        if (this.scenes.has(data.sceneID)) {
            return this.scenes.get(data.sceneID);
        }
        const scene = this.stateFactory.createScene(data);
        if (data.controls) {
            scene.addControls(data.controls);
        }
        this.scenes.set(data.sceneID, scene);
        this.emit('sceneCreated', scene);
        return scene;
    }

    public getScene(id: string): Scene {
        return this.scenes.get(id);
    }

    public getControl(id: string): IControl {
        let result: IControl;
        this.scenes.forEach(scene => {
            result = scene.getControl(id);
        });
        return result;
    }

    private getParticipantBy(field: string, value: any): IParticipant {
        let result;
        this.participants.forEach(participant => {
            if (participant[field] === value) {
                result = participant;
            }
        });
        return result;
    }
    /**
     * Retrieve a participant by their Beam UserId.
     */
    public getParticipantByUserID(id: number): IParticipant {
        return this.getParticipantBy('userID', id);
    }

    /**
     * Retrieve a participant by their Beam Username.
     */
    public getParticipantByUsername(name: string): IParticipant {
        return this.getParticipantBy('username', name);
    }
    /**
     * Retrieve a participant by their sessionID
     */
    public getParticipantBySessionID(id: string): IParticipant {
        return this.participants.get(id);
    }
}
