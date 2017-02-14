import { IButton, IButtonData } from '../interfaces/controls/IButton';
import { IButonInput } from '../interfaces/controls/IInput';
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
        // TODO Clock sync
        return this.updateAttribute('cooldown', Date.now() + duration);
    }

    public giveInput(input: IButonInput): Promise<void> {
        return this.sendInput(input);
    }
}
