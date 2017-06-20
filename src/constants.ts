import { IGridLayout } from './state/interfaces/controls';

/**
 * Offers constant information values to use in an application.
 */
export module InteractiveConstants {
    export const gridLayoutSizes: IGridLayout[] = <IGridLayout[]> Object.freeze([
        {
            size: 'large',
            width: 80,
            height: 20,
        }, {
            size: 'medium',
            width: 45,
            height: 25,
        }, {
            size: 'small',
            width: 30,
            height: 40,
        },
    ]);
}
