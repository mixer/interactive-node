import { IParticipant } from '../';
import { IControl, IControlData } from './IControl';
import { IInputEvent, IJoystickInput } from './IInput';

export interface IJoystickData extends IControlData {
    angle?: number;
    intensity?: number;
    sampleRate?: number;
}

export interface IJoystickCoords {
    x: number;
    y: number;
}

export interface IJoystick extends IControl, IJoystickData {
    angle: number;
    intensity: number;
    sampleRate: number;
    // GameClient
    setAngle(angle: number): Promise<void>;
    setIntensity(intensity: number): Promise<void>;

    on(event: 'move', listener: (inputEvent: IInputEvent<IJoystickInput>, participant: IParticipant) => void): this;
    on(event: string, listener: Function): this;
}
