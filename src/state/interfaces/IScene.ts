import { EventEmitter } from 'events';
import { ETag } from './controls';

import { IControl, IControlData } from './controls/IControl';
import { IMeta } from './controls/IMeta';

export interface ISceneDataArray {
    scenes: ISceneData[];
}

/**
 * Included in messages when a scene is deleted.
 * Provides information on where participants on
 * the deleted scene should be redirected to.
 */
export interface ISceneDeletionParams {
    /**
     * The deleted scene ID.
     */
    sceneID: string;
    /**
     * The scene which
     */
    reassignSceneID: string;
}
/**
 * Represents the raw data of a scene as it is represented on the wire.
 */
export interface ISceneData {
    /**
     * A unique ID for this scene.
     */
    sceneID: string;
    /**
     * A collection of controls which are on this scene.
     */
    controls: IControlData[];
    /**
     * A collection of meta properties which this scene has.
     */
    meta?: IMeta;

    /**
     * @deprecated etags are no longer used, you can always omit/ignore this
     */
    etag?: ETag;
}

export interface IScene extends EventEmitter {
    sceneID: string;
    controls: Map<string, IControl>;
    meta: IMeta;

    /**
     * @deprecated etags are no longer used, you can always omit/ignore this
     */
    etag: string;
    //TODO groups
    groups: any;

    getControl(id: string): IControl;
    getControls(): IControl[];

    createControl(controlData: IControlData): Promise<IControl>;
    createControls(controls: IControlData[]): Promise<IControl[]>;
    updateControls(controls: IControlData[]): Promise<void>;
    deleteControls(controlIDs: string[]): Promise<void>;
    deleteControl(controlIDs: string): Promise<void>;
    deleteAllControls(): Promise<void>;

    onControlsCreated(controls: IControlData[]): IControl[];
    onControlsUpdated(controls: IControlData[]): void;
    onControlsDeleted(controls: IControlData[]): void;

    update(scene: ISceneData): void;

    destroy(): void;

    /**
     * Fired when a control is added to the scene.
     */
    on(event: 'controlAdded', listener: (control: IControl) => void): this;
    /**
     * Fired when a control is removed from the scene.
     */
    on(event: 'controlDeleted', listener: (controlId: string) => void): this;
    /**
     * Fired when the scene is updated with new data from the server.
     */
    on(event: 'update', listener: (controlId: this) => void): this;
    on(event: string, listener: Function): this;
}

export interface ISceneControlDeletion {
    sceneID: string;
    controlIDs: string[];
}
