import { EventEmitter } from 'events';
import { ClientType } from './Client';

import { InteractiveError } from './errors';
import {
    IControl,
    IGroupDataArray,
    IGroupDeletionParams,
    IInput,
    IParticipantArray,
    ISceneControlDeletion,
    ISceneData,
    ISceneDataArray,
} from './state/interfaces';
import { IState } from './state/IState';

export interface IClient extends EventEmitter {
    clientType: ClientType;
    state: IState;
    execute<T>(method: string, params: T, discard: boolean): Promise<any>;
    ready(isReady: boolean): Promise<void>;

    createControls(controls: ISceneData): Promise<IControl[]>;
    createGroups(groups: IGroupDataArray): Promise<IGroupDataArray>;
    createScenes(scenes: ISceneDataArray): Promise<ISceneDataArray>;
    updateControls(controls: ISceneData): Promise<void>;
    updateGroups(groups: IGroupDataArray): Promise<IGroupDataArray>;
    deleteControls(controls: ISceneControlDeletion): Promise<void>;
    deleteGroup(data: IGroupDeletionParams): Promise<void>;
    updateScenes(scenes: ISceneDataArray): Promise<void>;
    updateParticipants(participants: IParticipantArray): Promise<void>;
    giveInput<T extends IInput>(_: T): Promise<void>;

    getTime(): Promise<number>;

    on(event: 'open', listener: () => void): this;
    on(event: 'send', listener: (payload: string) => void): this;
    on(event: 'message', listener: (payload: string) => void): this;
    on(event: 'error', listener: (err: InteractiveError.Base) => void): this;
    on(event: 'hello', listener: () => void): this;
    on(event: string, listener: Function): this;
}
