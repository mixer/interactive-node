import { IControl } from './IControl';

export interface IScene {
    sceneId: string;
    controls: IControl[];
    //TODO
    groups: any;
}
