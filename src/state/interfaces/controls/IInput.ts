export interface IInput {
    controlID?: string;
    event: string;
}

export interface IButtonInput extends IInput {
    event: 'mousedown' | 'mouseup';
    button: number;
}

export interface IJoystickInput extends IInput {
    event: 'move';
    x: number;
    y: number;
}

export interface IInputEvent<T> {
    participantID: string;
    input: T;
    transactionID?: string;
}

export interface ITransactionCapture {
    transactionID: string;
}
