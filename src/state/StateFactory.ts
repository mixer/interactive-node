import { Button, Control, Joystick } from './controls';
import { IControlData } from './interfaces/controls';

import { IClient } from '../IClient';
import { ISceneData } from './interfaces/IScene';
import { Scene } from './Scene';
/**
 * The StateFactory creates the apropriate instance of a class for a given socket message.
 */
export class StateFactory {
    private client: IClient;

    public setClient(client: IClient) {
        this.client = client;
    }

    public createControl<T extends IControlData>(
        controlKind: string,
        values: T,
        scene: Scene,
    ): Control<T> {
        let control: Control<T>;

        switch (controlKind) {
            case 'button':
                control = new Button(values);
                break;
            case 'joystick':
                control = new Joystick(values);
                break;
            default:
                throw new Error('Unknown control type');
        }
        control.setClient(this.client);
        control.setScene(scene);
        return control;
    }

    public createScene(values: ISceneData): Scene {
        const scene = new Scene(values);
        scene.setClient(this.client);
        return scene;
    }
}
