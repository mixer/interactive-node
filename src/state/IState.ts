import { EventEmitter } from 'events';

import { IClient } from '../IClient';
import { Method, Reply } from '../wire/packets';
import { Group } from './Group';
import { IScene, ISceneData, ISceneDataArray } from './interfaces';
import { IControl } from './interfaces/controls/IControl';
import { IGroup } from './interfaces/IGroup';
import { IParticipant } from './interfaces/IParticipant';

export interface IState extends EventEmitter {
    setClient(client: IClient): void;
    processMethod(method: Method<any>): void | Reply;
    synchronizeLocalTime(time?: Date | number): Date;
    synchronizeRemoteTime(time?: Date | number): Date;

    reset(): void;

    getGroup(id: string): IGroup;
    getScene(id: string): IScene;
    onSceneCreate(data: ISceneData): IScene;
    synchronizeScenes(data: ISceneDataArray): IScene[];

    getControl(id: string): IControl;

    getParticipantByUserID(id: number): IParticipant;
    getParticipantByUsername(name: string): IParticipant;
    getParticipantBySessionID(id: string): IParticipant;

    on(event: 'ready', listener: (ready: boolean) => void): this;

    on(event: 'selfUpdate', listener: (self: IParticipant) => void): this;

    on(event: 'participantJoin', listener: (participant: IParticipant) => void): this;
    on(event: 'participantLeave', listener: (participantSessionID: string) => void): this;

    on(event: 'sceneDeleted', listener: (sceneID: string, reassignSceneID: string) => void): this;
    on(event: 'sceneCreated', listener: (scene: IScene) => void): this;

    on(event: 'groupDeleted', listener: (groupID: string, reassignGroupID: string) => void): this;
    on(event: 'groupCreated', listener: (group: Group) => void): this;
    on(event: string, listener: Function): this;

}
