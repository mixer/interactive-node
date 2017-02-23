export type IGridSize = 'large' | 'medium' | 'small';

export interface IGridConfig {
    // The name of the grid, usually the size
    name: IGridSize;
    // The width of this grid in number of grid units
    width: number;
    // The height of this grid in number of grid units
    height: number;
    // The minimum width in pixels required for this grid to be selected.
    minWidth: number;

    //TODO is this needed?
    top: number;
}
