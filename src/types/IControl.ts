import { IGridSize } from './IGridConfig';
import { IMeta } from './IMeta';

export type IControlKind = 'button' | 'joystick';
/**
 * IControl is the base interface for any V2 Control
 */
export interface IControl {
    controlID: string;
    kind: IControlKind;
    disabled: boolean;
    meta: IMeta;
    composition: IComposition;
}

export interface IComposition {
    grids: IGridPlacement[];
}

export interface IGridPlacement {
    size: IGridSize;
    width: number;
    height: number;
    x: number;
    y: number;
}
