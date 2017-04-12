import { EventEmitter } from 'events';
import { ClientType } from './Client';
import { IInput } from './state/interfaces/controls';
import { ISceneDataArray } from './state/interfaces/IScene';
import { IState } from './state/IState';

export interface IClient extends EventEmitter {
    clientType: ClientType;
    state: IState;
    execute<T>(method: string, params: T, discard: boolean): Promise<any>;

    updateControls(controls: ISceneDataArray): Promise<void>;
    updateScenes(scenes: ISceneDataArray): Promise<void>;
    giveInput<T extends IInput>(_: T): Promise<void>;

    getTime(): Promise<number>;

    on(event: 'open', listener: () => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: string, listener: Function): this;
}
