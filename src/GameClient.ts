import { Client, ClientType } from './Client';
import { ISceneData, ISceneDataArray } from './state/interfaces';

export interface IGameClientOptions {
    experienceId: number;
    authToken: string;
    url: string;
}

export class GameClient extends Client {
    constructor(options: IGameClientOptions) {
        super({
            clientType: ClientType.GameClient,
            socketOptions: {
                authToken: options.authToken,
                url: `${options.url}/gameClient`,
                extraHeaders: {
                    'X-Interactive-Version': options.experienceId,
                },
            },
        });
    }

    public createControls(data: ISceneData) {
        return this.execute('createControls', data, false).then(res => {
            const scene = this.state.getScene(data.sceneID);
            res.controls.forEach(control => scene.addControl(control));
        });
    }

    public updateControls(params: ISceneDataArray): Promise<void> {
        return this.execute('updateControls', params, false);
    }

    public updateScenes(scenes: ISceneDataArray): Promise<any> {
        return this.execute('updateScenes', scenes, false);
    }
}
