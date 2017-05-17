import { IParticipant } from '../';
import { IControl, IControlData } from './IControl';
import { IButtonInput, IInputEvent } from './IInput';

/**
 * Extends the regular control data with additional properties for Buttons
 */
export interface IButtonData extends IControlData {
    /**
     * The text displayed on the button.
     */
    text?: string;
    /**
     * The spark cost of this button.
     */
    cost?: number;
    /**
     * The progress bar value of this button. 0 - 1.
     */
    progress?: number;
    /**
     * A unix timestamp of when this button's cooldown will expire.
     */
    cooldown?: number;
    /**
     * A JavaScript keycode which participants can use to activate this button.
     */
    keyCode?: number;
}

export interface IButton extends IControl, IButtonData {
    text: string;
    cost: number;
    progress: number;
    cooldown: number;
    keyCode: number;
    // GameClient
    setText(text: string): Promise<void>;
    setProgress(progress: number): Promise<void>;
    setCooldown(duration: number): Promise<void>;
    setCost(cost: number): Promise<void>;

    /**
     * Fired when a participant presses this button.
     */
    on(event: 'mousedown', listener: (inputEvent: IInputEvent<IButtonInput>, participant: IParticipant) => void): this;
    /**
     * Fired when a participant releases this button.
     */
    on(event: 'mouseup', listener: (inputEvent: IInputEvent<IButtonInput>, participant: IParticipant) => void): this;
    on(event: string, listener: Function): this;
}
