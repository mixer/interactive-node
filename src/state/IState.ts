import { EventEmitter } from 'events';

import { IClient } from '../IClient';
import { Method, Reply } from '../wire/packets';
import { Group } from './Group';
import { IScene, ISceneData, ISceneDataArray } from './interfaces';
import { IControl } from './interfaces/controls/IControl';
import { IGroup, IGroupDataArray } from './interfaces/IGroup';
import { IParticipant } from './interfaces/IParticipant';

export interface IState extends EventEmitter {
    setClient(client: IClient): void;
    processMethod(method: Method<any>): void | Reply;
    synchronizeLocalTime(time?: Date | number): Date;
    synchronizeRemoteTime(time?: Date | number): Date;

    reset(): void;

    getGroups(): Map<string, IGroup>;
    getGroup(id: string): IGroup;
    getScenes(): Map<string, IScene>;
    getScene(id: string): IScene;
    onSceneCreate(data: ISceneData): IScene;
    synchronizeScenes(data: ISceneDataArray): IScene[];
    synchronizeGroups(data: IGroupDataArray): IGroup[];

    getControl(id: string): IControl;

    getParticipants(): Map<string, IParticipant>;
    getParticipantByUserID(id: number): IParticipant;
    getParticipantByUsername(name: string): IParticipant;
    getParticipantBySessionID(id: string): IParticipant;

    /**
     * Fired when the ready state of the interactive session changes.
     */
    on(event: 'ready', listener: (ready: boolean) => void): this;

    /**
     * Fired when the connected participant's state is updated
     */
    on(event: 'selfUpdate', listener: (self: IParticipant) => void): this;
    /**
     * Fired when a participant joins.
     */
    on(event: 'participantJoin', listener: (participant: IParticipant) => void): this;
    /**
     * Fired when a participant leaves.
     */
    on(event: 'participantLeave', listener: (participantSessionID: string, participant: IParticipant) => void): this;

    /**
     * Fired when a scene is deleted.
     */
    on(event: 'sceneDeleted', listener: (sceneID: string, reassignSceneID: string) => void): this;
    /**
     * Fired when a scene is created.
     */
    on(event: 'sceneCreated', listener: (scene: IScene) => void): this;

    /**
     * Fired when a group is deleted.
     */
    on(event: 'groupDeleted', listener: (groupID: string, reassignGroupID: string) => void): this;
    /**
     * Fired when a group is created.
     */
    on(event: 'groupCreated', listener: (group: Group) => void): this;
    on(event: string, listener: Function): this;

}
