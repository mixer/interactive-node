import { IGridLayout } from './state/interfaces/controls';

/**
 * Offers constant information values to use in an application.
 */
export const gridLayoutSizes = Object.freeze(<IGridLayout[]>[
    {
        size: 'large',
        width: 80,
        height: 20,
    },
    {
        size: 'medium',
        width: 45,
        height: 25,
    },
    {
        size: 'small',
        width: 30,
        height: 40,
    },
]);
