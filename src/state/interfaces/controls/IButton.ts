import { IParticipant } from '../';
import { IControl, IControlData } from './IControl';
import { IButtonInput, IInputEvent } from './IInput';

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

    on(event: 'mousedown', listener: (inputEvent: IInputEvent<IButtonInput>, participant: IParticipant) => void): this;
    on(event: 'mouseup', listener: (inputEvent: IInputEvent<IButtonInput>, participant: IParticipant) => void): this;
    on(event: string, listener: Function): this;
}
