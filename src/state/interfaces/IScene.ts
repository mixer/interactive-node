import { EventEmitter } from 'events';

import { IControl, IControlData } from './controls/IControl';
import { IMeta } from './controls/IMeta';

export interface ISceneDataArray {
    scenes: ISceneData[];
}

export interface ISceneDeletionParams {
    sceneID: string;
    reassignSceneID: string;
}

export interface ISceneData {
    sceneID: string;
    controls: IControlData[];
    meta?: IMeta;
    etag?: string;
}

export interface IScene extends EventEmitter {
    sceneID: string;
    controls: Map<string, IControl>;
    meta: IMeta;
    etag: string;
    //TODO groups
    groups: any;

    getControl(id: string): IControl;
    getControls(): IControl[];
    addControl(controlData: IControlData): IControl;

    update(scene: ISceneData): void;

    destroy(): void;
    // Frontend

    // GameClient

}

export interface ISceneControlDeletion {
    sceneID: string;
    controlIDs: string[];
}
