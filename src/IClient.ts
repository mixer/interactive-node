import { ISceneDataArray } from './state/interfaces/IScene';

export interface IClient {
    execute<T>(method: string, params: T, discard: boolean): Promise<any>;
    //Update
    updateControls(controls: ISceneDataArray): Promise<any>;
    updateScenes(scenes: ISceneDataArray): Promise<any>;

    getTime(): Promise<number>;
}
