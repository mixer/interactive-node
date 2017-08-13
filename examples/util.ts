import { IButtonData, IControlData, IGridPlacement } from '../lib';
export function makeControls(amount: number = 5, textGenerator: (i: number) => string): IControlData[] {
    const controls: IButtonData[] = [];
    const size = 10;
    for (let i = 0; i < amount; i++) {
        controls.push({
            controlID: `${i}`,
            kind: 'button',
            text: textGenerator(i),
            cost: 1,
            position: getGridPlacement(i, 0, size),
        });
    }
    return controls;
}

// This makes grid placement objects dynamically, to be used for our controls below.
export function getGridPlacement(x: number, y: number, size: number = 10): IGridPlacement[] {
    return [
        {
            size: 'large',
            width: size,
            height: size,
            x: x * size,
            y: y * size,
        },
        {
            size: 'medium',
            width: size,
            height: size,
            x: x * size,
            y: y * size,
        },
        {
            size: 'small',
            width: size,
            height: size,
            x: x * size,
            y: y * size,
        },
    ];
}
