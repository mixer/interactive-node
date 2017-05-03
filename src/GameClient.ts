import { Client, ClientType } from './Client';
import { getInteractiveEndpoints } from './endpoints';
import { ISceneControlDeletion, ISceneData, ISceneDataArray } from './state/interfaces';
import { IControl } from './state/interfaces/controls/IControl';

export interface IGameClientOptions {
    versionId: number;
    authToken: string;
    url?: string;
}

export class GameClient extends Client {
    constructor() {
        super(ClientType.GameClient);
    }

    public open(options: IGameClientOptions): Promise<this> {
        return getInteractiveEndpoints()
        .then(endpoints => {
            return super.open({
                authToken: options.authToken,
                url: endpoints[0].address,
                extraHeaders: {
                    'X-Interactive-Version': options.versionId,
                },
            });
        });
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

    public ready(isReady: boolean = true): Promise<void> {
        return this.execute('ready', { isReady }, false);
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
