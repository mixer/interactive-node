import { ISceneDataArray } from './state/interfaces/IScene';

export interface IClient {
    execute<T>(method: string, params: T, discard: boolean): Promise<any>;

    updateControls(controls: ISceneDataArray): Promise<void>;
    updateScenes(scenes: ISceneDataArray): Promise<void>;

    getTime(): Promise<number>;
}
