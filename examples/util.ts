import { IButtonData, IControlData } from '../lib';
export function makeControls(amount: number = 5, textGenerator: (i:number) => string):IControlData[] {
    const controls: IButtonData[] = [];
    const size = 10;
    for (let i = 0; i < amount; i++) {
        controls.push({
            controlID: `${i}`,
            kind: 'button',
            text: textGenerator(i),
            cost: 1,
            position: [
                   {
                       size: 'large',
                       width: size,
                       height: size / 2,
                       x: i * size,
                       y: 1,
                   },
                   {
                       size: 'small',
                       width: size,
                       height: size / 2,
                       x: i * size,
                       y: 1,
                   },
                   {
                       size: 'medium',
                       width: size,
                       height: size,
                       x: i * size,
                       y: 1,
                   },
               ],
            },
        );
    }
    return controls;
}
