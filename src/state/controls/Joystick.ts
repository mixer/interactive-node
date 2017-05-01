import { IJoystickInput } from '../interfaces/controls/IInput';
import { IJoystick, IJoystickData } from '../interfaces/controls/IJoystick';
import { Control } from './Control';

/**
 * Joysticks can be moved by participants and will report their coordinates down to GameClients
 */
export class Joystick extends Control<IJoystickData> implements IJoystick {
    public angle: number;
    public intensity: number;
    public sampleRate: number;

    /**
     * Sets the angle of the direction indicator for this joystick.
     */
    public setAngle(angle: number): Promise<void> {
        return this.updateAttribute('angle', angle);
    }

    /**
     * Sets the opacity/strength of the direction indicator for this joystick.
     */
    public setIntensity(intensity: number): Promise<void> {
        return this.updateAttribute('intensity', intensity);
    }

    /**
     * Sends an input event from a participant to the server for consumption.
     */
    public giveInput(input: IJoystickInput): Promise<void> {
        return this.sendInput(input);
    }
}
