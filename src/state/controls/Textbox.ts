import { ITextboxInput } from '../interfaces/controls/IInput';
import {
    ITextbox,
    ITextboxData,
    ITextboxUpdate,
} from '../interfaces/controls/ITextbox';
import { Control } from './Control';

/**
 * Textboxs can be pushed by participants with their mouse or activated with their keyboards.
 */
export class Textbox extends Control<ITextboxData> implements ITextbox {
    /**
     * The text hint inside the textbox, presented to the participants.
     * Set this value using [setPlaceholder]{@link Textbox.setPlaceholder}
     */
    public placeholder: string;
    /**
     * The spark cost of this textbox in sparks.
     * Set this value using [setCost]{@link Textbox.setCost}
     */
    public cost: number;
    /**
     * If set this value is the Unix Timestamp at which this textbox's cooldown will expire.
     * Set this value using [setCooldown]{@link Textbox.setCooldown}
     */
    public cooldown: number;
    /**
     * The text displayed within the submit button for the textbox.
     * Set this value using [setSubmitText]{@link Textbox.setSubmitText}
     */
    public submitText: string;
    /**
     * Shows the submit button for the textbox, presented to the participants.
     */
    public hasSubmit: boolean;
    /**
     * Sets the textbox displayed to the participants  to be singleline or multiline.
     */
    public multiline: boolean;

    /**
     * Sets a new placeholder value for this textbox.
     */
    public setPlaceholder(placeholder: string): Promise<void> {
        return this.updateAttribute('placeholder', placeholder);
    }

    /**
     * Sets a new submit button text value for this textbox.
     */
    public setSubmitText(submitText: string): Promise<void> {
        return this.updateAttribute('submitText', submitText);
    }

    /**
     * Sets the cooldown for this textbox. Specified in Milliseconds.
     * The Client will convert this to a Unix timestamp for you.
     */
    public setCooldown(duration: number): Promise<void> {
        const target =
            this.client.state.synchronizeLocalTime().getTime() + duration;
        return this.updateAttribute('cooldown', target);
    }

    /**
     * Sets the spark cost for this textbox.
     * An Integer greater than 0
     */
    public setCost(cost: number): Promise<void> {
        return this.updateAttribute('cost', cost);
    }

    /**
     * Sends an input event from a participant to the server for consumption.
     */
    public giveInput(input: ITextboxInput): Promise<void> {
        return this.sendInput(input);
    }

    /**
     * Update this textbox on the server.
     */
    public update(controlUpdate: ITextboxUpdate): Promise<void> {
        // Clone to prevent mutations
        // XXX: Typescript 2.4 is strict, let the compiler be clever.
        const changedData = Object.assign({}, controlUpdate);
        if (changedData.cooldown) {
            changedData.cooldown =
                this.client.state.synchronizeLocalTime().getTime() +
                changedData.cooldown;
        }
        return super.update(changedData);
    }
}
