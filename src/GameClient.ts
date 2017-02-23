import { Client, ClientType } from './Client';
import { ISceneData, ISceneDataArray } from './state/interfaces';
import { IControl } from './state/interfaces/controls/IControl';

export interface IGameClientOptions {
    experienceId: number;
    authToken: string;
    url: string;
}

export class GameClient extends Client {
    constructor() {
        super(ClientType.GameClient);
    }

    public open(options: IGameClientOptions): this {
        super.open({
            authToken: options.authToken,
            url: `${options.url}/gameClient`,
            extraHeaders: {
                'X-Interactive-Version': options.experienceId,
            },
        });
        return this;
    }

    public createControls(data: ISceneData): Promise<IControl[]> {
        return this.execute('createControls', data, false)
            .then(res => {
                const scene = this.state.getScene(data.sceneID);
                if (!scene) {
                    return this.state.addScene(data).getControls();
                }
                return res.controls.map(control => scene.addControl(control));
            });
    }

    public updateControls(params: ISceneDataArray): Promise<void> {
        return this.execute('updateControls', params, false);
    }

    public updateScenes(scenes: ISceneDataArray): Promise<void> {
        return this.execute('updateScenes', scenes, false);
    }
}
