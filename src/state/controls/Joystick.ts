import { IJoystickInput } from '../interfaces/controls/IInput';
import { IJoystick, IJoystickData } from '../interfaces/controls/IJoystick';
import { Control } from './Control';

export class Joystick extends Control<IJoystickData> implements IJoystick {
    public angle: number;
    public intensity: number;
    public sampleRate: number;

    public setAngle(angle: number): Promise<void> {
        return this.updateAttribute('angle', angle);
    }

    public setIntensity(intensity: number): Promise<void> {
        return this.updateAttribute('intensity', intensity);
    }

    public giveInput(input: IJoystickInput): Promise<void> {
        return this.sendInput(input);
    }
}
