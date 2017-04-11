import { EventEmitter } from 'events';

import { IClient } from '../IClient';
import { merge } from '../merge';
import { IControl, IControlData } from './interfaces/controls/IControl';
import { IMeta } from './interfaces/controls/IMeta';
import { IScene, ISceneData } from './interfaces/IScene';
import { StateFactory } from './StateFactory';

export class Scene extends EventEmitter implements IScene {
    public sceneID: string;
    public controls = new Map<string, IControl>();
    public groups: any;
    public etag: string;
    public meta: IMeta = {};

    private client: IClient;

    public setClient(client: IClient) {
        this.client = client;
        this.stateFactory.setClient(client);
    }

    private stateFactory = new StateFactory();

    constructor(data: ISceneData) {
        super();
        this.sceneID = data.sceneID;
        this.etag = data.etag || '';
        this.meta = data.meta || {};
    }

    /**
     * Called when controls are added to this scene.
     */
    public onControlsCreated(controls: IControlData[]): IControl[] {
        return controls.map(control => this.onControlCreated(control));
    }

    /**
     * Called when a control is added to this scene.
     */
    private onControlCreated(controlData: IControlData): IControl {
        let control = this.controls.get(controlData.controlID);
        if (control) {
            if (control.etag === controlData.etag) {
                return control;
            }
            this.onControlUpdated(controlData);
            return control;
        }
        control = this.stateFactory.createControl(controlData.kind, controlData, this);
        this.controls.set(control.controlID, control);
        this.emit('controlAdded', control);
        return control;
    }

    /**
     * Called when controls are deleted from this scene.
     */
    public onControlsDeleted(controls: IControlData[]) {
        controls.forEach(control => this.onControlDeleted(control));
    }

    /**
     * Called when a control is deleted from this scene.
     */
    private onControlDeleted(control: IControlData) {
        this.controls.delete(control.controlID);
        this.emit('controlDeleted', control.controlID);
    }

    private onControlUpdated(controlData: IControlData) {
        const control = this.getControl(controlData.controlID);
        if (control) {
            control.update(controlData);
        }
    }

    public onControlsUpdated(controls: IControlData[]) {
        controls.forEach(control => this.onControlUpdated(control));
    }

     public getControl(id: string): IControl {
        return this.controls.get(id);
    }

    public getControls(): IControl[] {
        return Array.from(this.controls.values());
    }

    public createControl(control: IControlData): Promise<IControl> {
        return this.createControls([control])
            .then(res => res[0]);
    }

    public createControls(controls: IControlData[]): Promise<IControl[]> {
        return this.client.createControls({sceneID: this.sceneID, controls});
    }

    /**
     * Deletes controls in this scene from the server
     */
    public deleteControls(controlIDs: string[]): Promise<void> {
        return this.client.deleteControls({sceneID: this.sceneID, controlIDs: controlIDs});
    }

    public deleteControl(controlId: string) {
        return this.deleteControls([controlId]);
    }

    public destroy() {
        //TODO find the group they should now be on
        this.controls.forEach(control => {
            this.emit('controlDeleted', control);
        });
    }

    public update(scene: ISceneData) {
        if (scene.meta) {
            merge(this.meta, scene.meta);
            this.emit('update', this);
        }
    }

    public deleteAllControls(): Promise<void> {
        const ids: string[] = [];
        this.controls.forEach((_, key) => {
            ids.push(key);
        });
        return this.deleteControls(ids);
    }
}
