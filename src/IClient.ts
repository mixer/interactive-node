import { EventEmitter } from 'events';

import { ClientType } from './Client';
import { ISceneControlDeletion } from './state/interfaces';
import { IInput } from './state/interfaces/controls';
import { ISceneDataArray } from './state/interfaces/IScene';
import { State } from './state/State';

export interface IClient extends EventEmitter {
    clientType: ClientType;
    state: State;
    execute<T>(method: string, params: T, discard: boolean): Promise<any>;

    updateControls(controls: ISceneDataArray): Promise<void>;
    deleteControls(controls: ISceneControlDeletion): Promise<void>;
    updateScenes(scenes: ISceneDataArray): Promise<void>;
    giveInput<T extends IInput>(_: T): Promise<void>;

    getTime(): Promise<number>;
}
