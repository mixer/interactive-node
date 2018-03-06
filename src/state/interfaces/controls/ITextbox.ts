import { IParticipant } from '../';
import { IControl, IControlData, IControlUpdate } from './IControl';
import { IInputEvent, ITextboxInput  } from './IInput';

/**
 * Extends the regular control data with additional properties for Textbox
 */
export interface ITextboxData extends IControlData {
    /**
     * The text hint inside the textbox.
     */
    placeholder?: string;
    /**
     * The optional text to replace "Submit" on the submit button.
     */
    submitText?: string;
    /**
     * The spark cost of this textbox. A cost will force a submit button.
     */
    cost?: number;
    /**
     * In milliseconds, will be converted to a unix timestamp of when this cooldown expires.
     */
    cooldown?: number;
    /**
     * Whether the textbox has a submit button.
     */
    hasSubmit?: boolean;
    /**
     * Whether the textbox supports multiple lines of text.
     */
    multiline?: boolean;
}

/**
 * Represents updatable components of a label which developers can update
 * from game clients.
 */
export interface ITextboxUpdate extends IControlUpdate {
    /**
     * Will update the text hint inside the textbox.
     */
    placeholder?: string;
    /**
     * Will update the optional text to replace "Submit" on the submit button.
     */
    submitText?: string;
    /**
     * Will update the spark cost of this textbox. A cost will force a submit button.
     */
    cost?: number;
    /**
     * In milliseconds, will be converted to a unix timestamp of when this cooldown expires.
     */
    cooldown?: number;
    /**
     * Will update Whether the textbox has a submit button.
     */
    hasSubmit?: boolean;
    /**
     * Will update Whether the textbox supports multiple lines of text.
     */
    multiline?: boolean;
}

export interface ITextbox extends IControl, ITextboxData {
    placeholder: string;
    submitText: string;
    cost: number;
    cooldown: number;
    hasSubmit: boolean;
    multiline: boolean;
    // GameClient
    setPlaceholder(placeholder: string): Promise<void>;
    setSubmitText(submitText: string): Promise<void>;
    setCooldown(duration: number): Promise<void>;
    setCost(cost: number): Promise<void>;
    update(changedData: ITextboxUpdate): Promise<void>;

    /**
     * Fired when a participant presses a key inside the text input.
     * Does not send if there is a spark cost or if control has submit.
     */
    on(
        event: 'change',
        listener: (
            inputEvent: IInputEvent<ITextboxInput>,
            participant: IParticipant,
        ) => void,
    ): this;
    /**
     * Fired when a participant submits the text.
     * Submit can be called via clicking the submit button or via pressing the
     * Enter key when the textbox is singleline, or Ctrl + Enter when textbox is multiline.
     */
    on(
        event: 'submit',
        listener: (
            inputEvent: IInputEvent<ITextboxInput>,
            participant: IParticipant,
        ) => void,
    ): this;

    on(event: string, listener: Function): this;
}
