import { ITransaction } from './ITransaction';

export interface IInput {
    controlID?: string;
    event: string;
}

export interface IButonInput extends IInput {
    event: 'mousedown' | 'mouseup';
    button: number;
    transaction?: ITransaction;
}

export interface IJoystickInput extends IInput {
    event: 'move';
    x: number;
    y: number;
}

export interface IInputEvent {
    participantID: string;
    input: IInput;
}
