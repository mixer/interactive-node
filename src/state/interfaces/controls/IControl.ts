import { EventEmitter } from 'events';

import { IParticipant } from '../';
import { ISceneDataArray } from '../IScene';
import { IGridSize } from './IGridConfig';
import { IInput, IInputEvent } from './IInput';
import { IMeta } from './IMeta';

export type ControlKind = 'button' | 'joystick';

export interface IControlData {
    controlID?: string;
    kind?: ControlKind;
    disabled?: boolean;
    meta?: IMeta;
    position?: IPosition;
    etag?: string;
}
/**
 * IControl is the base interface for any V2 Control
 */
export interface IControl extends IControlData, EventEmitter {
    // Frontend
    /**
     * Give input causes the control to give input to the mediator status in response to a
     * control event. For example a mousedown on a button would end up here.
     * @memberOf IControl
     */
    giveInput<T extends IInput>(input: T): Promise<void>;

    receiveInput(input: IInputEvent, participant: IParticipant): void;

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

    destroy(): void;
}

export interface IPosition {
    grids: IGridPlacement[];
}

export interface IGridPlacement {
    size: IGridSize;
    width: number;
    height: number;
    x: number;
    y: number;
}

export interface IControlUpdate {
    scenes: ISceneDataArray;
}
