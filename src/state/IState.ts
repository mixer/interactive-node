import { EventEmitter } from 'events';

import { IClient } from '../IClient';
import { Method, Reply } from '../wire/packets';
import { Group } from './Group';
import { IScene, ISceneData } from './interfaces';
import { IControl } from './interfaces/controls/IControl';
import { IGroup } from './interfaces/IGroup';
import { IParticipant } from './interfaces/IParticipant';

export interface IState extends EventEmitter {

    setClient(client: IClient): void;
    processMethod(method: Method<any>): void | Reply;
    synchronizeLocalTime(time: Date | number): Date;
    synchronizeRemoteTime(time: Date | number): Date;

    reset(): void;
    updateScene(scene: ISceneData): void;
    deleteScene(sceneID: string, reassignSceneID: string): void;

    addScene(data: ISceneData): void;
    updateGroup(group: IGroup): void;
    deleteGroup(groupID: string, reassignGroupID: string): void;

    addGroup(data: IGroup): Group;
    getGroup(id: string): Group;
    getScene(id: string): IScene;

    getControl(id: string): IControl;

    getParticipantByUserID(id: number): IParticipant;
    getParticipantByUsername(name: string): IParticipant;
    getParticipantBySessionID(id: string): IParticipant;

}
