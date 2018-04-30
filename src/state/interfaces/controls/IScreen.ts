import { IParticipant } from '../IParticipant';
import { IControl, IControlData, IControlUpdate } from './IControl';
import { IInputEvent, IScreenInput } from './IInput';
/**
 * Extends the regular control data with additional properties for Textbox
 */
export interface IScreenData extends IControlData {
  /**
     * Whether the control will send coordinates on mousemove
     */
  sendOnMove?: boolean;
  /**
     * Whether the control will send coordinates on mousedown
     */
  sendMoveOnMouseDown?: boolean;
  /**
     * The debounce rate for input sent
     */
  moveDeboune?: number;
}

/**
 * Represents updatable components of a scren control which developers can
 * update from game clients.
 */
export interface IScreenUpdate extends IControlUpdate {
  /**
     * Whether the control will send coordinates on mousemove
     */
  sendOnMove?: boolean;
  /**
     * Whether the control will send coordinates on mousedown
     */
  sendMoveOnMouseDown?: boolean;
  /**
     * The debounce rate for input sent
     */
  moveDeboune?: number;
}

export interface IScreen extends IControl, IScreenData {
  sendOnMove: boolean;
  sendMoveOnMouseDown: boolean;
  moveDeboune: number;
  // GameClient
  update(changedData: IScreenUpdate): Promise<void>;

  giveInput(input: IScreenInput): Promise<void>;

  /**
   * Fired when a participant moves cursor.
   */
  on(
      event: 'move',
      listener: (inputEvent: IInputEvent<IScreenInput>, participant: IParticipant) => void,
  ): this;
  /**
   * Fired when a participant presses this button with their mouse.
   */
  on(
      event: 'mousedown',
      listener: (inputEvent: IInputEvent<IScreenInput>, participant: IParticipant) => void,
  ): this;
  on(event: string, listener: Function): this;
}
