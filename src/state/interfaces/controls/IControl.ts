import { EventEmitter } from 'events';

import { IParticipant } from '../';
import { IClient } from '../../../IClient';
import { ISceneDataArray } from '../IScene';
import { IInput, IInputEvent } from './IInput';
import { IMeta } from './IMeta';

export type ControlKind = 'button' | 'joystick';
export type GridSize = 'large' | 'medium' | 'small';


/**
 * Represents the raw data a control has when transmitted
 * and recieved over a socket connection.
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
     * Wether or not this control is disabled
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
    etag?: string;
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

    receiveInput<T extends IInput>(input: IInputEvent<T>, participant: IParticipant): void;

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
    update(controlData: IControlData): void;

    on(event: 'deleted', listener: (control: IControl) => void): this;
    on(event: 'updated', listener: (control: IControl) => void): this;
    on(event: string, listener: Function): this;

    destroy(): void;
}

export interface IGridPlacement {
    size: GridSize;
    width: number;
    height: number;
    x: number;
    y: number;
}

export interface IControlUpdate {
    scenes: ISceneDataArray;
}
