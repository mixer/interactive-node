import { EventEmitter } from 'events';
import { merge } from 'lodash';

import { ClientType } from '../Client';
import { ClockSync } from '../ClockSync';
import { InteractiveError } from '../errors';
import { IClient } from '../IClient';
import { MethodHandlerManager } from '../methods/MethodHandlerManager';
import { Method, Reply } from '../wire/packets';
import { Group } from './Group';
import { IParticipant, IScene } from './interfaces';
import { IControl } from './interfaces/controls/IControl';
import { IGroup } from './interfaces/IGroup';
import { ISceneData } from './interfaces/IScene';
import { Scene } from './Scene';
import { StateFactory } from './StateFactory';

export class State extends EventEmitter {
    public groups = new Map<string, Group>();;
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

        // Group Events
        this.methodHandler.addHandler('onGroupCreate', res => {
            res.params.groups.forEach(group => this.addGroup(group));
        });
        this.methodHandler.addHandler('onGroupDelete', res => {
            this.deleteGroup(res.params.groupID, res.params.reassignGroupID);
        });
        this.methodHandler.addHandler('onGroupUpdate', res => {
            res.params.groups.forEach(group => this.updateGroup(group));
        });

        this.methodHandler.addHandler('onControlCreate', res => {
            const scene = this.scenes.get(res.params.sceneID);
            if (scene) {
                scene.addControls(res.params.controls);
            }
        });

        this.methodHandler.addHandler('onControlDelete', res => {
            const scene = this.scenes.get(res.params.sceneID);
            if (scene) {
                scene.deleteControls(res.params.controls);
            }
        });

        this.methodHandler.addHandler('onControlUpdate', res => {
            const scene = this.scenes.get(res.params.sceneID);
            if (scene) {
                scene.updateControls(res.params.controls);
            }
        });
        this.clockSyncer.on('delta', (delta: number) => {
            this.clockDelta = delta;
        });

        if (this.clientType === ClientType.GameClient) {
            this.addGameClientHandlers();
        } else {
            this.addParticipantHandlers();
        }
    }

    private addParticipantHandlers() {
        // A participant only gets onParticipantUpdate/Join events for themselves.
        this.methodHandler.addHandler('onParticipantUpdate', res => {
            this.emit('selfUpdate', res.params.participants[0]);
        });
        this.methodHandler.addHandler('onParticipantJoin', res => {
            this.emit('selfUpdate', res.params.participants[0]);
        });
    }

    private addGameClientHandlers() {
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
        this.client.on('open', () => this.clockSyncer.start());
        this.client.on('close', () => this.clockSyncer.stop());
        this.stateFactory.setClient(client);
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

    /**
     * Returns the local time matched to the sync of the Beam server clock.
     */
    public synchronizeLocalTime(time: Date | number = Date.now()): Date {
        if (time instanceof Date) {
            time = time.getTime();
        }
        return new Date(time - this.clockDelta);
    }

    /**
     * Returns the remote time matched to the local clock.
     */
    public synchronizeRemoteTime(time: Date | number): Date {
        if (time instanceof Date) {
            time = time.getTime();
        }
        return new Date(time + this.clockDelta);
    }

    public reset() {
        this.scenes.forEach(scene => scene.destroy());
        this.scenes.clear();
        this.clockDelta = 0;
        this.isReady = false;
        this.participants.clear();
    }

    /**
     * Updates an existing scene in the game session.
     */
    public updateScene(scene: ISceneData) {
        const targetScene = this.getScene(scene.sceneID);
        if (targetScene) {
            targetScene.update(scene);
        }
    }

    /**
     * Removes a scene and reassigns the groups that were on it.
     */
    public deleteScene(sceneID: string, reassignSceneID: string) {
        const targetScene = this.getScene(sceneID);
        if (targetScene) {
            targetScene.destroy();
            this.scenes.delete(sceneID);
            this.emit('sceneDeleted', sceneID, reassignSceneID);
        }
    }

    /**
     * Inserts a new scene into the game session.
     */
    public addScene(data: ISceneData): Scene {
        let scene = this.scenes.get(data.sceneID);
        if (scene) {
            if (scene.etag === data.etag) {
                return this.scenes.get(data.sceneID);
            }
            this.updateScene(data);
            return scene;
        }
        scene = this.stateFactory.createScene(data);
        if (data.controls) {
            scene.addControls(data.controls);
        }
        this.scenes.set(data.sceneID, scene);
        this.emit('sceneCreated', scene);
        return scene;
    }

    /**
     * Updates an existing scene in the game session.
     */
    public updateGroup(group: IGroup) {
        const targetGroup = this.getGroup(group.groupID);
        if (targetGroup) {
            targetGroup.update(group);
        }
    }

    /**
     * Removes a group and reassigns the groups that were on it.
     */
    public deleteGroup(groupID: string, reassignGroupID: string) {
        const targetGroup = this.getGroup(groupID);
        if (targetGroup) {
            targetGroup.destroy();
            this.groups.delete(groupID);
            this.emit('groupDeleted', groupID, reassignGroupID);
        }
    }

    /**
     * Inserts a new scene into the game session.
     */
    public addGroup(data: IGroup): Group {
        let group = this.groups.get(data.groupID);
        if (group) {
            if (group.etag === data.etag) {
                return this.groups.get(data.groupID);
            }
            this.updateGroup(data);
            return group;
        }
        group = new Group(data);
        this.groups.set(data.groupID, group);
        this.emit('groupCreated', group);
        return group;
    }

    public getGroup(id: string): Group {
        return this.groups.get(id);
    }

    public getScene(id: string): IScene {
        return this.scenes.get(id);
    }

    public getControl(id: string): IControl {
        let result: IControl;
        this.scenes.forEach(scene => {
            result = scene.getControl(id);
        });
        return result;
    }

    private getParticipantBy<K extends keyof IParticipant>(field: K, value: IParticipant[K]): IParticipant {
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
