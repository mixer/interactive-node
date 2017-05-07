import { EventEmitter } from 'events';
import { IState } from './IState';

import { ClientType } from '../Client';
import { ClockSync } from '../ClockSync';
import { InteractiveError } from '../errors';
import { IClient } from '../IClient';
import { merge } from '../merge';
import { MethodHandlerManager } from '../methods/MethodHandlerManager';
import { Method, Reply } from '../wire/packets';
import { Group } from './Group';
import { IParticipant, IScene, ISceneDataArray } from './interfaces';
import { IControl } from './interfaces/controls/IControl';
import { IGroup } from './interfaces/IGroup';
import { ISceneData } from './interfaces/IScene';
import { Scene } from './Scene';
import { StateFactory } from './StateFactory';

/**
 * State is a store of all of the components of an interactive session.
 *
 * It contains Scenes, Groups and Participants and keeps them up to date by listening to
 * interactive events which update and change them. You can query State to
 * examine and alter components of the interactive session.
 */
export class State extends EventEmitter implements IState {
    /**
     * A Map of group ids to their corresponding Group Object.
     */
    private groups = new Map<string, Group>();
    /**
     * the ready state of this session, is the GameClient in this session ready to recieve input?
     */
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

    /**
     * Constructs a new State instance. Based on the passed client type it will
     * hook into the apropriate methods for that type to keep itself up to date.
     */
    constructor(private clientType: ClientType) {
        super();

        this.methodHandler.addHandler('onReady', readyMethod => {
            this.isReady = readyMethod.params.isReady;
            this.emit('ready', this.isReady);
        });

        // Scene Events
        this.methodHandler.addHandler('onSceneCreate', res => {
            res.params.scenes.forEach(scene => this.onSceneCreate(scene));
        });
        this.methodHandler.addHandler('onSceneDelete', res => {
            this.onSceneDelete(res.params.sceneID, res.params.reassignSceneID);
        });
        this.methodHandler.addHandler('onSceneUpdate', res => {
            res.params.scenes.forEach(scene => this.onSceneUpdate(scene));
        });

        // Group Events
        this.methodHandler.addHandler('onGroupCreate', res => {
            res.params.groups.forEach(group => this.onGroupCreate(group));
        });
        this.methodHandler.addHandler('onGroupDelete', res => {
            this.onGroupDelete(res.params.groupID, res.params.reassignGroupID);
        });
        this.methodHandler.addHandler('onGroupUpdate', res => {
            res.params.groups.forEach(group => this.onGroupUpdate(group));
        });

        // Control Events
        this.methodHandler.addHandler('onControlCreate', res => {
            const scene = this.scenes.get(res.params.sceneID);
            if (scene) {
                scene.onControlsCreated(res.params.controls);
            }
        });

        this.methodHandler.addHandler('onControlDelete', res => {
            const scene = this.scenes.get(res.params.sceneID);
            if (scene) {
                scene.onControlsDeleted(res.params.controls);
            }
        });
        this.methodHandler.addHandler('onControlUpdate', res => {
            const scene = this.scenes.get(res.params.sceneID);
            if (scene) {
                scene.onControlsUpdated(res.params.controls);
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

    /**
     * Syncronize scenes takes a collection of scenes from the server
     * and hydrates the Scene store with them.
     */
    public synchronizeScenes(data: ISceneDataArray): IScene[] {
        return data.scenes.map(scene => this.onSceneCreate(scene));
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

    /**
     * Processes a server side method using State's method handler.
     */
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

    /**
     * Completely clears this state instance emptying all Scene, Group and Participant records
     */
    public reset() {
        this.scenes.forEach(scene => scene.destroy());
        this.scenes.clear();
        this.clockDelta = 0;
        this.isReady = false;
        this.participants.clear();
        this.groups.clear();
    }

    /**
     * Updates an existing scene in the game session.
     */
    public onSceneUpdate(scene: ISceneData) {
        const targetScene = this.getScene(scene.sceneID);
        if (targetScene) {
            targetScene.update(scene);
        }
    }

    /**
     * Removes a scene and reassigns the groups that were on it.
     */
    public onSceneDelete(sceneID: string, reassignSceneID: string) {
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
    public onSceneCreate(data: ISceneData): IScene {
        let scene = this.scenes.get(data.sceneID);
        if (scene) {
            if (scene.etag === data.etag) {
                return this.scenes.get(data.sceneID);
            }
            this.onSceneUpdate(data);
            return scene;
        }
        scene = this.stateFactory.createScene(data);
        if (data.controls) {
            scene.onControlsCreated(data.controls);
        }
        this.scenes.set(data.sceneID, scene);
        this.emit('sceneCreated', scene);
        return scene;
    }

    /**
     * Adds an array of Scenes to its state store.
     */
    public addScenes(scenes: ISceneData[]): IScene[] {
        return scenes.map(scene => this.onSceneCreate(scene));
    }

    /**
     * Updates an existing scene in the game session.
     */
    public onGroupUpdate(group: IGroup) {
        const targetGroup = this.getGroup(group.groupID);
        if (targetGroup) {
            targetGroup.update(group);
        }
    }

    /**
     * Removes a group and reassigns the participants that were in it.
     */
    public onGroupDelete(groupID: string, reassignGroupID: string) {
        const targetGroup = this.getGroup(groupID);
        if (targetGroup) {
            targetGroup.destroy();
            this.groups.delete(groupID);
            this.emit('groupDeleted', groupID, reassignGroupID);
        }
    }

    /**
     * Inserts a new group into the game session.
     */
    public onGroupCreate(data: IGroup): Group {
        let group = this.groups.get(data.groupID);
        if (group) {
            if (group.etag === data.etag) {
                return this.groups.get(data.groupID);
            }
            this.onGroupUpdate(data);
            return group;
        }
        group = new Group(data);
        this.groups.set(data.groupID, group);
        this.emit('groupCreated', group);
        return group;
    }

    /**
     * Retrieve a group with the matching ID from the group store.
     */
    public getGroup(id: string): Group {
        return this.groups.get(id);
    }

    /**
     * Retrieve a scene with the matching ID from the scene store.
     */
    public getScene(id: string): IScene {
        return this.scenes.get(id);
    }

    /**
     * Searches through all stored Scenes to find a Control with the matching ID
     */
    public getControl(id: string): IControl {
        let result: IControl;
        this.scenes.forEach(scene => {
            const found = scene.getControl(id);
            if (found) {
                result = found;
            }
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
     * Retrieve a participant by their sessionID with the current Interactive session.
     */
    public getParticipantBySessionID(id: string): IParticipant {
        return this.participants.get(id);
    }
}
