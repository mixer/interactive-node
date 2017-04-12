import { EventEmitter } from 'events';
import { ClientType } from './Client';

import { IState } from './state/IState';
import {
    IControl,
    IInput,
    ISceneControlDeletion,
    ISceneData,
    ISceneDataArray,
} from './state/interfaces';

export interface IClient extends EventEmitter {
    clientType: ClientType;
    state: IState;
    execute<T>(method: string, params: T, discard: boolean): Promise<any>;
    ready(isReady: boolean): Promise<void>;

    createControls(controls: ISceneData): Promise<IControl[]>;
    updateControls(controls: ISceneDataArray): Promise<void>;
    deleteControls(controls: ISceneControlDeletion): Promise<void>;
    updateScenes(scenes: ISceneDataArray): Promise<void>;
    giveInput<T extends IInput>(_: T): Promise<void>;

    getTime(): Promise<number>;

    on(event: 'open', listener: () => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: string, listener: Function): this;
}
