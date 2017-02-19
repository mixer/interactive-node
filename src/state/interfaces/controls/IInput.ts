import { IParticipant } from '../../../../lib/src/state/interfaces';
import { ControlKind } from './IControl';
import { ITransaction } from './ITransaction';

export interface IInputControlData {
    controlID: string;
    kind: ControlKind;
}
export interface IInput {
    control: IInputControlData;
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
    participant: IParticipant;
    input: IInput;
}
