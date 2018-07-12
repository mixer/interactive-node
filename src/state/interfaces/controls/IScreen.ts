import { IParticipant } from '../IParticipant';
import { IControl, IControlData, IControlUpdate } from './IControl';
import { IInputEvent, IScreenInput } from './IInput';

export declare type MoveEventType = 'always' | 'mousedown' | 'never';
/**
 * Extends the regular control data with additional properties for Textbox
 */
export interface IScreenData extends IControlData {
    /**
     * How the control will handle move events
     */
    sendMoveEvents?: MoveEventType;
    /**
     * The throttle rate for input sent
     */
    moveThrottle?: number;
    /**
     * Whether the control sends the mouse down event.
     */
    sendMouseDownEvent?: boolean;
    /**
     * Whether the control sends the mouse up event.
     */
    sendMouseUpEvent?: boolean;
}

/**
 * Represents updatable components of a scren control which developers can
 * update from game clients.
 */
export interface IScreenUpdate extends IControlUpdate {
    /**
     * How the control will handle move events
     */
    sendMoveEvents?: MoveEventType;
    /**
     * The throttle rate for input sent
     */
    moveThrottle?: number;
    /**
     * Whether the control sends the mouse down event.
     */
    sendMouseDownEvent?: boolean;
    /**
     * Whether the control sends the mouse up event.
     */
    sendMouseUpEvent?: boolean;
}

export interface IScreen extends IControl, IScreenData {
    sendMoveEvents: MoveEventType;
    moveThrottle: number;
    sendMouseDownEvent: boolean;
    sendMouseUpEvent: boolean;
    // GameClient
    update(changedData: IScreenUpdate): Promise<void>;

    giveInput(input: IScreenInput): Promise<void>;

    /**
   * Fired when a participant moves cursor.
   */
    on(
        event: 'move',
        listener: (inputEvent: IInputEvent<IScreenInput>, participant: IParticipant) => void,
    ): this;
    /**
   * Fired when a participant presses this button with their mouse.
   */
    on(
        event: 'mousedown',
        listener: (inputEvent: IInputEvent<IScreenInput>, participant: IParticipant) => void,
    ): this;
    on(event: string, listener: Function): this;
}
