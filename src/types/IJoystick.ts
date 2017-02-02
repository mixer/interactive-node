import { IControl } from './IControl';

export interface IJoystick extends IControl {
    angle: number;
    intensity: number;
}
