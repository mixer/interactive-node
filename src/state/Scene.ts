import { EventEmitter } from 'events';
import { merge } from 'lodash';

import { IClient } from '../IClient';
import { mapToArray } from '../util';
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

    public addControls(controls: IControlData[]) {
        controls.forEach(control => this.addControl(control));
    }
    public addControl(controlData: IControlData): IControl {
        if (this.controls.has(controlData.controlID)) {
            return this.controls.get(controlData.controlID);
        }
        const control = this.stateFactory.createControl(controlData.kind, controlData, this);
        this.controls.set(control.controlID, control);
        this.emit('controlAdded', control);
        return control;
    }

    public getControl(id: string): IControl {
        return this.controls.get(id);
    }
    public getControls(): IControl[] {
        return mapToArray(this.controls);
    }

    public deleteControls(controls: IControlData[]) {
        controls.forEach(control => this.deleteControl(control));
    }

    public deleteControl(controlData: IControlData) {
        this.controls.delete(controlData.controlID);
        this.emit('controlDeleted', controlData.controlID);
    }
    public updateControl(controlData: IControlData) {
        const control = this.getControl(controlData.controlID);
        if (control) {
            control.update(controlData);
        }
    }
    public updateControls(controls: IControlData[]) {
        controls.forEach(control => this.updateControl(control));
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
}
