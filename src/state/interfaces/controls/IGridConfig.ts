export type IGridSize = 'large' | 'medium' | 'small';


// This defines how many units each measurement point on the control editor grid represents
export const gridScale: number = 12;

/**
 * A grid easurement indicates the amount of space a component takes up, or the position
 * of a component on an interactive grid. Its used in a ratio based calculation which can
 * convert a GridMeasurement into a real number of pixels for display on the frontend.
 *
 * @see pixelsPerGridUnit
 */
export type GridMeasurement = number;

export interface IGridConfig {
    // The name of the grid, usually the size
    name: IGridSize;
    // The width of this grid in number of grid units
    width: GridMeasurement;
    // The height of this grid in number of grid units
    height: GridMeasurement;
    // The minimum width in pixels required for this grid to be selected.
    minWidth: number;

    //TODO is this needed?
    top: number;
}
