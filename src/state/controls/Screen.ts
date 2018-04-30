import { IScreenInput } from '../interfaces/controls/IInput';
import { IScreen, IScreenData, IScreenUpdate } from '../interfaces/controls/IScreen';
import { Control } from './Control';

/**
 * Screen can be used to get mouse input
 */
export class Screen extends Control<IScreenData> implements IScreen {
  /**
     * Whether the control will send coordinates on mousemove
     */
  public sendOnMove: boolean;
  /**
     * Whether the control will send coordinates on mousedown
     */
  public sendMoveOnMouseDown: boolean;
  /**
     * The debounce rate for input sent
     */
  public moveDeboune: number;

  /**
     * Update this control on the server.
     */
  public update(controlUpdate: IScreenUpdate): Promise<void> {
    // Clone to prevent mutations
    // XXX: Typescript 2.4 is strict, let the compiler be clever.
    const changedData = { ...controlUpdate };
    return super.update(changedData);
  }

  /**
     * Sends an input event from a participant to the server for consumption.
     */
  public giveInput(input: IScreenInput): Promise<void> {
    return this.sendInput(input);
  }
}
