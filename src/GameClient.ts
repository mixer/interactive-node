import { Client, ClientType } from './Client';
import { ISceneControlDeletion, ISceneData, ISceneDataArray } from './state/interfaces';
import { IControl } from './state/interfaces/controls/IControl';

export interface IGameClientOptions {
    /**
     * Your experience id is a unique id to your Interactive Project Version. You can retrieve one
     * from the Interactive Studio on Beam.pro.
     */
    experienceId: number;
    /**
     * An OAuth Bearer token as defined in {@link https://art.tools.ietf.org/html/rfc6750| OAuth 2.0 Bearer Token Usage}
     */
    authToken: string;
    /**
     * An interactive server url, these can be retrieved from https://beam.pro/api/v1/interactive/hosts
     */
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
