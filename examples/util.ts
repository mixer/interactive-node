import { IButtonData, IControlData, IGridPlacement } from '../lib';

// tslint:disable-next-line
const CSS_COLOR_NAMES = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];

export function makeControls(amount: number = 5, textGenerator: (i: number) => string): IControlData[] {
    const controls: IButtonData[] = [];
    const size = 10;
    for (let i = 0; i < amount; i++) {
        controls.push({
            controlID: `${i}`,
            kind: 'button',
            text: textGenerator(i),
            tooltip: textGenerator(i),
            cost: Math.floor(Math.random() * Math.floor(100)),
            progress: Math.random(),
            backgroundColor: CSS_COLOR_NAMES[Math.floor(Math.random() * CSS_COLOR_NAMES.length)],
            textColor: CSS_COLOR_NAMES[Math.floor(Math.random() * CSS_COLOR_NAMES.length)],
            accentColor: CSS_COLOR_NAMES[Math.floor(Math.random() * CSS_COLOR_NAMES.length)],
            borderColor: CSS_COLOR_NAMES[Math.floor(Math.random() * CSS_COLOR_NAMES.length)],
            position: getGridPlacement(i, 0, size),
        });
    }
    return controls;
}

export function updateControls(controls: IControlData[], textGenerator: (i: number) => string): IControlData[] {
    controls.forEach((control: IButtonData, i) => {
        control.text = textGenerator(i);
        control.tooltip = textGenerator(i);
        control.cost = Math.floor(Math.random() * Math.floor(100));
        control.progress = Math.random();
        control.backgroundColor = CSS_COLOR_NAMES[Math.floor(Math.random() * CSS_COLOR_NAMES.length)];
        control.textColor = CSS_COLOR_NAMES[Math.floor(Math.random() * CSS_COLOR_NAMES.length)];
        control.accentColor = CSS_COLOR_NAMES[Math.floor(Math.random() * CSS_COLOR_NAMES.length)];
        control.borderColor = CSS_COLOR_NAMES[Math.floor(Math.random() * CSS_COLOR_NAMES.length)];
    });
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
