import { IControl } from './IControl';

export interface IButton extends IControl {
    text: string;
    cost: number;
    progress: number;
}
