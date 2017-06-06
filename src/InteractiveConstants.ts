import { IGridLayout } from './state/interfaces/controls';

/**
 * Offers constant information values to use in an application.
 */
export class InteractiveConstants {
    private static readonly _gridLayoutSizes: IGridLayout[] = [
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
    ];

	/**
     * @returns {{GridLayout[]}} a copy of the stored layout definitions to prevent users from breaking it.
	 */
	public static get gridLayoutSizes(): IGridLayout[] {
        return {...InteractiveConstants._gridLayoutSizes};
    }
}
