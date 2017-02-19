import { ISceneData } from '../lib/src/state/interfaces';
import { Client, ClientType } from './Client';

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
}
