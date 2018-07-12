import { IScreenInput } from '../interfaces/controls/IInput';
import { IScreen, IScreenData, MoveEventType } from '../interfaces/controls/IScreen';
import { Control } from './Control';

/**
 * Screen can be used to get mouse input
 */
export class Screen extends Control<IScreenData> implements IScreen {
    /**
     * How the control will handle move events
     */
    public sendMoveEvents: MoveEventType;
    /**
     * The throttle rate for input sent
     */
    public moveThrottle: number;
    /**
     * Whether the control sends the mouse down event.
     */
    public sendMouseDownEvent: boolean;
    /**
     * Whether the control sends the mouse up event.
     */
    public sendMouseUpEvent: boolean;

    /**
     * Sends an input event from a participant to the server for consumption.
     */
    public giveInput(input: IScreenInput): Promise<void> {
        return this.sendInput(input);
    }
}
