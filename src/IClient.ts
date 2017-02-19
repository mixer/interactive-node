import { ClientType } from './Client';
import { IInput } from './state/interfaces/controls';
import { ISceneDataArray } from './state/interfaces/IScene';

export interface IClient {
    clientType: ClientType;
    execute<T>(method: string, params: T, discard: boolean): Promise<any>;

    updateControls(controls: ISceneDataArray): Promise<void>;
    updateScenes(scenes: ISceneDataArray): Promise<void>;
    giveInput<T extends IInput>(_: T): Promise<void>;

    getTime(): Promise<number>;
}
