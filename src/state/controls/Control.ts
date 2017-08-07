import { EventEmitter } from 'events';

import { IClient } from '../../IClient';
import { merge } from '../../merge';
import { IParticipant } from '../interfaces';
import {
    ControlKind,
    IControl,
    IControlData,
    IControlUpdate,
    IGridPlacement,
} from '../interfaces/controls/IControl';
import { IInput, IInputEvent } from '../interfaces/controls/IInput';
import { IMeta } from '../interfaces/controls/IMeta';
import { Scene } from '../Scene';

/**
 * Control is used a base class for all other controls within an interactive session.
 * It contains shared logic which all types of controls can utilize.
 */
export abstract class Control<T extends IControlData> extends EventEmitter
    implements IControl {
    public controlID: string;
    public kind: ControlKind;
    public disabled: boolean;
    public position: IGridPlacement[];
    /** @deprecated etags are no longer used, you can always omit/ignore this */
    public etag: string;
    public meta: IMeta;

    protected scene: Scene;
    public client: IClient;

    /**
     * Sets the scene this control belongs to.
     */
    public setScene(scene: Scene) {
        this.scene = scene;
    }
    /**
     * Sets the client instance this control can use to execute methods.
     */
    public setClient(client: IClient) {
        this.client = client;
    }

    constructor(control: T) {
        super();
        merge<IControlData>(this, control);
    }

    // A base control class cannot give input
    public abstract giveInput(input: IInput): Promise<void>;

    /**
     * Called by client when it receives an input event for this control from the server.
     */
    public receiveInput<T extends IInput>(
        inputEvent: IInputEvent<T>,
        participant: IParticipant,
    ) {
        this.emit(inputEvent.input.event, inputEvent, participant);
    }

    protected sendInput<K extends IInput>(input: K): Promise<void> {
        // We add this on behalf of the controls so that they don't have to worry about the
        // Protocol side too much
        input.controlID = this.controlID;
        return this.client.giveInput(input);
    }

    /**
     * Disables this control, preventing participant interaction.
     */
    public disable(): Promise<void> {
        return this.updateAttribute('disabled', true);
    }
    /**
     * Enables this control, allowing participant interaction.
     */
    public enable(): Promise<void> {
        return this.updateAttribute('disabled', false);
    }

    protected updateAttribute<K extends keyof T>(
        attribute: K,
        value: T[K],
    ): Promise<void> {
        const packet: T = <T>{};
        packet.controlID = this.controlID;

        packet[attribute] = value;

        return this.client.updateControls({
            sceneID: this.scene.sceneID,
            controls: [packet],
        });
    }

    /**
     * Merges in values from the server in response to an update operation from the server.
     */
    public onUpdate(controlData: IControlData) {
        merge(this, controlData);
        this.emit('updated', this);
    }

    /**
     * Update this control on the server.
     */
    public update<T2 extends IControlUpdate>(controlUpdate: T2): Promise<void> {
        const changedData = {
            ...<IControlUpdate>controlUpdate,
            controlID: this.controlID,
        };

        return this.client.updateControls({
            sceneID: this.scene.sceneID,
            controls: [changedData],
        });
    }

    public destroy(): void {
        this.emit('deleted', this);
    }
}
