import { EventEmitter } from 'events';

import { ClientType } from './Client';
import {
    IControl,
    IInput,
    ISceneControlDeletion,
    ISceneData,
    ISceneDataArray,
} from './state/interfaces';
import { State } from './state/State';

export interface IClient extends EventEmitter {
    clientType: ClientType;
    state: State;
    execute<T>(method: string, params: T, discard: boolean): Promise<any>;

    createControls(controls: ISceneData): Promise<IControl[]>;
    updateControls(controls: ISceneDataArray): Promise<void>;
    deleteControls(controls: ISceneControlDeletion): Promise<void>;
    updateScenes(scenes: ISceneDataArray): Promise<void>;
    giveInput<T extends IInput>(_: T): Promise<void>;

    getTime(): Promise<number>;
}
