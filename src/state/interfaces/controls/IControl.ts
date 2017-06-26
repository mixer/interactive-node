import { EventEmitter } from 'events';

import { ETag, IParticipant } from '../';
import { IClient } from '../../../IClient';
import { IInput, IInputEvent } from './IInput';
import { IMeta } from './IMeta';

export type ControlKind = 'button' | 'joystick';
export type GridSize = 'large' | 'medium' | 'small';

export interface IGridLayout {
    readonly size: GridSize;
    readonly width: number;
    readonly height: number;
}

/**
 * Represents the raw data a control has when transmitted
 * and received over a socket connection.
 */
export interface IControlData {
    /**
     * An id, unique to the session.
     */
    controlID?: string;
    /**
     * The type of control.
     */
    kind?: ControlKind;
    /**
     * Wether or not this control is disabled.
     */
    disabled?: boolean;
    /**
     * The collection of Meta properties for this control.
     */
    meta?: IMeta;
    /**
     * A collection of grid placements controlling where the control
     * is positioned on screen.
     */
    position?: IGridPlacement[];
    /**
     * The control's ETag.
     */
    etag?: ETag;
}

/**
 * Represents updatable components of a control which developers can update
 * from game clients.
 */
export interface IControlUpdate {
    /**
     * When set to true this will disable the control.
     * When set to false this will enable the control.
     */
    disabled?: boolean;
}

/**
 * Control is used a base class for all other controls within an interactive session.
 * It contains shared logic which all types of controls can utilize.
 */
export interface IControl extends IControlData, EventEmitter {
    client: IClient;

    // Frontend
    /**
     * Give input causes the control to give input to the mediator status in response to a
     * control event. For example a mousedown on a button would end up here.
     */
    giveInput<T extends IInput>(input: T): Promise<void>;

    receiveInput<T extends IInput>(
        input: IInputEvent<T>,
        participant: IParticipant,
    ): void;

    // GameClient
    /**
     * Disables this control, preventing all participants from providing input to this control
     */
    disable(): Promise<void>;
    /**
     * Enables this control.
     */
    enable(): Promise<void>;

    /**
     * Merges in updated control data from the mediator
     */
    onUpdate(controlData: IControlData): void;

    /**
     * Updates the control with the supplied update parameters
     */
    update(controlUpdate: IControlUpdate): Promise<void>;

    /**
     * Fired when the control is deleted.
     */
    on(event: 'deleted', listener: (control: IControl) => void): this;
    /**
     * Fired when the control is updated with new data.
     */
    on(event: 'updated', listener: (control: IControl) => void): this;
    on(event: string, listener: Function): this;

    destroy(): void;
}

/**
 * A grid placement represents a placement of a control within a scene.
 * It controls how the control is rendered.
 *
 * A control can have many grid placements where each placement is used within
 * a different interactive grid.
 */
export interface IGridPlacement {
    /**
     * The Size of the grid this placement is for.
     */
    size: GridSize;
    /**
     * The width of this control within the grid.
     */
    width: number;
    /**
     * The height of this control within the grid.
     */
    height: number;
    /**
     * The X position of this control within the grid.
     */
    x: number;
    /**
     * The Y position of this control within the grid.
     */
    y: number;
}
