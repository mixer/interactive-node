import {
    IButton,
    IButtonData,
    IButtonUpdate,
} from '../interfaces/controls/IButton';
import { IButtonInput } from '../interfaces/controls/IInput';
import { Control } from './Control';

/**
 * Buttons can be pushed by participants with their mouse or activated with their keyboards.
 */
export class Button extends Control<IButtonData> implements IButton {
    /**
     * The text displayed on a button, presented to the participants.
     * Set this value using [setText]{@link Button.setText}
     */
    public text: string;
    /**
     * The tooltip text displayed when the participant hovers over the button.
     * Set this value using [setTooltip]{@link Button.setTooltip}
     */
    public tooltip: string;
    /**
     * The spark cost of this button in sparks.
     * Set this value using [setCost]{@link Button.setCost}
     */
    public cost: number;
    /**
     * A decimalized percentage (0.0 - 1.0) which controls how wide
     * this button's progress bar is.
     *
     * Set this value using [setProgress]{@link Button.setProgress}
     */
    public progress: number;
    /**
     * If set this value is the Unix Timestamp at which this button's cooldown will expire.
     * Set this value using [setCooldown]{@link Button.setCooldown}
     */
    public cooldown: number;
    /**
     * A keycode which will trigger this button if pressed on a participant's keyboard.
     */
    public keyCode: number;

    /**
     * Sets a new text value for this button.
     */
    public setText(text: string): Promise<void> {
        return this.updateAttribute('text', text);
    }

    /**
     * Sets a new tooltip value for this button.
     */
    public setTooltip(tooltip: string): Promise<void> {
        return this.updateAttribute('tooltip', tooltip);
    }

    /**
     * Sets a progress value for this button.
     * A decimalized percentage (0.0 - 1.0)
     */
    public setProgress(progress: number): Promise<void> {
        return this.updateAttribute('progress', progress);
    }

    /**
     * Sets the cooldown for this button. Specified in Milliseconds.
     * The Client will convert this to a Unix timestamp for you.
     */
    public setCooldown(duration: number): Promise<void> {
        const target =
            this.client.state.synchronizeLocalTime().getTime() + duration;
        return this.updateAttribute('cooldown', target);
    }

    /**
     * Sets the spark cost for this button.
     * An Integer greater than 0
     */
    public setCost(cost: number): Promise<void> {
        return this.updateAttribute('cost', cost);
    }

    /**
     * Sends an input event from a participant to the server for consumption.
     */
    public giveInput(input: IButtonInput): Promise<void> {
        return this.sendInput(input);
    }

    /**
     * Update this button on the server.
     */
    public update(controlUpdate: IButtonUpdate): Promise<void> {
        // Clone to prevent mutations
        // XXX: Typescript 2.4 is strict, let the compiler be clever.
        const changedData = Object.assign({}, controlUpdate );
        if (changedData.cooldown) {
            changedData.cooldown =
                this.client.state.synchronizeLocalTime().getTime() +
                changedData.cooldown;
        }
        return super.update(changedData);
    }
}
