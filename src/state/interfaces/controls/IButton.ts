import { IControl, IControlData } from './IControl';

export interface IButtonData extends IControlData {
    text?: string;
    cost?: number;
    progress?: number;
    cooldown?: number;
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
}
