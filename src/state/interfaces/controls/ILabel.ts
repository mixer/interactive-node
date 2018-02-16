import { IControl, IControlData, IControlUpdate } from './IControl';

/**
 * Extends the regular control data with additional properties for Label
 */
export interface ILabelData extends IControlData {
    /**
     * The text displayed on the label.
     */
    text?: string;
    /**
     * The color of the text.
     */
    textColor?: string;
    /**
     * The size of the text.
     */
    textSize?: string;
    /**
     * Whether the text is underlined.
     */
    underline?: boolean;
    /**
     * Whether the text is bold.
     */
    bold?: boolean;
    /**
     * Whether the text is italicized.
     */
    italic?: boolean;
}

/**
 * Represents updatable components of a label which developers can update
 * from game clients.
 */
export interface ILabelUpdate extends IControlUpdate {
    /**
     * Will update the text of this label.
     */
    text?: string;
    /**
     * Will update the text color.
     */
    textColor?: string;
    /**
     * Will update the text size.
     */
    textSize?: string;
    /**
     * Will update if the text is underlined or not.
     */
    underline?: boolean;
    /**
     * Will update if the text is bold or not.
     */
    bold?: boolean;
    /**
     * Will update if the text is itlaic or not.
     */
    italic?: boolean;
}

export interface ILabel extends IControl, ILabelData {
    text: string;
    textSize: string;
    textColor: string;
    underline: boolean;
    bold: boolean;
    italic: boolean;
    // GameClient
    setText(text: string): Promise<void>;
    setTextSize(textSize: string): Promise<void>;
    setTextColor(textColor: string): Promise<void>;
    update(changedData: ILabelUpdate): Promise<void>;
}
