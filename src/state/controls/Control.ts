import { EventEmitter } from 'events';

import { IClient } from '../../IClient';
import { merge } from '../../merge';
import { IParticipant } from '../interfaces';
import {
    ControlKind,
    IControl,
    IControlData,
    IGridPlacement,
} from '../interfaces/controls/IControl';
import { IInput, IInputEvent } from '../interfaces/controls/IInput';
import { IMeta } from '../interfaces/controls/IMeta';
import { Scene } from '../Scene';

export abstract class Control<T extends IControlData> extends EventEmitter implements IControl {
    public controlID: string;
    public kind: ControlKind;
    public disabled: boolean;
    public position: IGridPlacement[];
    public etag: string;
    public meta: IMeta;

    protected scene: Scene;
    public client: IClient;

    public setScene(scene: Scene) {
        this.scene = scene;
    }

    public setClient(client: IClient) {
        this.client = client;
    }

    constructor(control: T) {
        super();
        merge<IControlData>(this, control);
    }

    // A base control class cannot give input
    public abstract giveInput<T extends IInput>(input: T): Promise<void>;

    public receiveInput<T extends IInput>(input: IInputEvent<T>, participant: IParticipant) {
        this.emit(input.input.event, input, participant);
    }

    protected sendInput<K extends IInput>(input: K): Promise<void> {
        // We add this on behalf of the controls so that they don't have to worry about the
        // Protocol side too much
        input.controlID = this.controlID;
        return this.client.giveInput(input);
    }

    public disable(): Promise<void> {
        return this.updateAttribute('disabled', true);
    }

    public enable(): Promise<void> {
        return this.updateAttribute('disabled', false);
    }

    protected updateAttribute<K extends keyof T>(
        attribute: K,
        value: T[K],
    ): Promise<void> {
        const packet: T = <T>{};
        packet.etag = this.etag;
        packet.controlID = this.controlID;

        packet[attribute] = value;

        return this.client.updateControls({
            scenes: [
                {
                    sceneID: this.scene.sceneID,
                    controls: [packet],
                },
            ],
        });
    }

    public update(controlData: IControlData) {
        merge(this, controlData);
        this.emit('updated', this);
    }

    public destroy(): void {
        this.emit('deleted', this);
    }
}
