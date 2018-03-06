import {
    ILabel,
    ILabelData,
    ILabelUpdate,
} from '../interfaces/controls/ILabel';
import { Control } from './Control';

/**
 * Label can be used to title and group different controls.
 */
export class Label extends Control<ILabelData> implements ILabel {
    /**
     * The text displayed on a label, presented to the participants.
     * Set this value using [setText]{@link Button.setText}
     */
    public text: string;

    /**
     * The size of the text on the label, presented to the participants.
     * Set this value using [setTextSize]{@link Button.setTextSize}
     */
    public textSize: string;

    /**
     * The color of the text on the label, presented to the participants.
     * Set this value using [setTextColor]{@link Button.setTextColor}
     */
    public textColor: string;

    /**
     * Underlines the text on the label, presented to the participants.
     */
    public underline: boolean;

    /**
     * Bolds the text on the label, presented to the participants.
     */
    public bold: boolean;

    /**
     * Italicize to text on the label, presented ot the participants.
     */
    public italic: boolean;

    /**
     * Sets a new text value for this label.
     */
    public setText(text: string): Promise<void> {
        return this.updateAttribute('text', text);
    }

    /**
     * Sets a progress value for this label.
     * A decimalized percentage (0.0 - 1.0)
     */
    public setTextSize(textSize: string): Promise<void> {
        return this.updateAttribute('textSize', textSize);
    }

    /**
     * Sets a new text color for this label.
     */
    public setTextColor(textColor: string): Promise<void> {
        return this.updateAttribute('textColor', textColor);
    }

    /**
     * Update this label on the server.
     */
    public update(controlUpdate: ILabelUpdate): Promise<void> {
        // Clone to prevent mutations
        // XXX: Typescript 2.4 is strict, let the compiler be clever.
        const changedData = Object.assign({}, controlUpdate );
        return super.update(changedData);
    }
}
