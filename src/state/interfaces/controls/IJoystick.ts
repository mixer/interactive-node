import { IParticipant } from '../';
import { IControl, IControlData } from './IControl';
import { IInputEvent, IJoystickInput } from './IInput';

/**
 * Extends the regular control data with additional properties for Joysticks
 */
export interface IJoystickData extends IControlData {
    /**
     * The angle of the Joysticks direction indicator.
     * In radians 0 - 2.
     */
    angle?: number;
    /**
     * Controls the strength/opacity of the direction indicator.
     */
    intensity?: number;
    /**
     * The requested sample rate for this joystick, the client should send
     * coordinate updates at this rate.
     *
     * In milliseconds.
     */
    sampleRate?: number;
}

/**
 * A joysticks coordinates.
 *
 * Where 1,1 is the bottom right and -1,-1 is the top left.
 */
export interface IJoystickCoords {
    x: number;
    y: number;
}

export interface IJoystick extends IControl, IJoystickData {
    angle: number;
    intensity: number;
    sampleRate: number;

    /**
     * Sets the angle of the direction indicator for this joystick.
     */
    setAngle(angle: number): Promise<void>;
    /**
     * Sets the opacity/strength of the direction indicator for this joystick.
     */
    setIntensity(intensity: number): Promise<void>;

    /**
     * Fired when a participant moves this joystick.
     */
    on(event: 'move', listener: (inputEvent: IInputEvent<IJoystickInput>, participant: IParticipant) => void): this;
    on(event: string, listener: Function): this;
}
