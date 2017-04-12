import { IButton, IButtonData } from '../interfaces/controls/IButton';
import { IButtonInput } from '../interfaces/controls/IInput';
import { Control } from './Control';

export class Button extends Control<IButtonData> implements IButton {
    public text: string;
    public cost: number;
    public progress: number;
    public cooldown: number;
    public keyCode: number;

    public setText(text: string): Promise<void> {
        return this.updateAttribute('text', text);
    }

    public setProgress(progress: number): Promise<void> {
        return this.updateAttribute('progress', progress);
    }

    public setCooldown(duration: number): Promise<void> {
        const target = this.client.state.synchronizeLocalTime().getTime() + duration;
        return this.updateAttribute('cooldown', target);
    }

    public giveInput(input: IButtonInput): Promise<void> {
        return this.sendInput(input);
    }
}
