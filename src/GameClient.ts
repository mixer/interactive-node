import { Client, ClientType } from './Client';
import { ISceneControlDeletion, ISceneData, ISceneDataArray } from './state/interfaces';
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
            url: options.url,
            extraHeaders: {
                'X-Interactive-Version': options.experienceId,
            },
        });
        return this;
    }

    public createControls(data: ISceneData): Promise<IControl[]> {
        return this.execute('createControls', data, false)
            .then(res => {
                const scene = this.state.getScene(res.sceneID);
                if (!scene) {
                    return this.state.onSceneCreate(res).getControls();
                }
                return scene.onControlsCreated(res.controls);
            });
    }

    public updateControls(params: ISceneDataArray): Promise<void> {
        return this.execute('updateControls', params, false);
    }

    public updateScenes(scenes: ISceneDataArray): Promise<void> {
        return this.execute('updateScenes', scenes, false);
    }

    public captureTransaction(transactionID: string): Promise<void> {
        return this.execute('capture', { transactionID }, false);
    }

    public deleteControls(data: ISceneControlDeletion): Promise<void> {
        return this.execute('deleteControls', data, false);
    }
}
