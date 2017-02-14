import { EventEmitter } from 'events';
import { merge, pull } from 'lodash';

import { IClient } from '../IClient';
import { IControl, IControlData } from './interfaces/controls/IControl';
import { IMeta } from './interfaces/controls/IMeta';
import { IScene, ISceneData } from './interfaces/IScene';
import { StateFactory } from './StateFactory';

export class Scene extends EventEmitter implements IScene {
    public sceneID: string;
    public controls: IControl[] = [];
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
        this.controls = this.addControls(data.controls);
    }

    public addControls(controls: IControlData[]) {
        return controls.map(control => this.addControl(control));
    }
    public addControl(controlData: IControlData): IControl {
        const control = this.stateFactory.createControl(controlData.kind, controlData, this);
        this.controls.push(control);
        this.emit('controlAdded', control);
        return control;
    }

    public getControls(): IControl[] {
        return this.controls;
    }

    public getControl(id: string): IControl {
        return this.controls.find(control => control.controlID === id);
    }

    public deleteControls(controls: IControlData[]) {
        controls.forEach(control => this.deleteControl(control));
    }

    public deleteControl(controlData: IControlData) {
        const control = this.getControl(controlData.controlID);
        if (control) {
            pull(this.controls, control);
            this.emit('controlDeleted', control);
        }
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
