/**
 * The base representation of the input portion of an input event.
 */
export interface IInput {
    /**
     * The controlId this input event relates to.
     */
    controlID?: string;
    /**
     * The event name of this input event.
     */
    event: string;
}

/**
 * Extends the base input to include button specific data.
 */
export interface IButtonMouseInput extends IInput {
    /**
     * Buttons can emit the mousedown(depressed) or mouseup(released) event.
     */
    event: 'mousedown' | 'mouseup';
    /**
     * Buttons additionally will report which button was used to trigger this event.
     *
     * See {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button | MouseEvent.button}
     * for more information.
     */
    button: number;
}

/**
 * Extends the base input to include button specific data.
 */
export interface IButtonKeyboardInput extends IInput {
    /**
     * Buttons can emit the keydown(depressed) or keyup(released) event.
     */
    event: 'keydown' | 'keyup';
}

export type IButtonInput = IButtonMouseInput | IButtonKeyboardInput;

/**
 * Extends the base input to include joystick specific data.
 */
export interface IJoystickInput extends IInput {
    /**
     * Joysticks can only be moved.
     */
    event: 'move';
    /**
     * The X coordinate of this joystick. -1 - 1.
     */
    x: number;
    /**
     * The Y coordinate of this joystick. -1 - 1.
     */
    y: number;
}

/**
 * An Input event ties input data together with the id of the participant who caused it.
 */
export interface IInputEvent<T> {
    /**
     * The session id of the participant who caused this input.
     */
    participantID: string;
    /**
     * The input data.
     */
    input: T;
    /**
     * A transaction id if this input event has created a transaction.
     */
    transactionID?: string;
}
/**
 * Used to describe the structure of a transaction capture attempt.
 */
export interface ITransactionCapture {
    transactionID: string;
}
