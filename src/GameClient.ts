import { Client, ClientType } from './Client';
import { EndpointDiscovery } from './EndpointDiscovery';
import { Requester } from './Requester';
import {
    IGroupDataArray,
    IGroupDeletionParams,
    IParticipantArray,
    ISceneControlDeletion,
    ISceneData,
    ISceneDataArray,
    ISceneDeletionParams,
} from './state/interfaces';
import { IControl } from './state/interfaces/controls/IControl';

export interface IGameClientOptions {
    /**
     * Your project version id is a unique id to your Interactive Project Version. You can retrieve one
     * from the Interactive Studio on Mixer.com in the Code step.
     */
    versionId: number;
    /**
     * An OAuth Bearer token as defined in {@link https://art.tools.ietf.org/html/rfc6750| OAuth 2.0 Bearer Token Usage}.
     */
    authToken: string;

    /**
     * A url which can be used to discover interactive servers.
     * Defaults to https://mixer.com/api/v1/interactive/hosts
     */
    discoveryUrl?: string;
}

export class GameClient extends Client {
    private discovery = new EndpointDiscovery(new Requester());
    constructor() {
        super(ClientType.GameClient);
    }
    /**
     * Opens a connection to the interactive service using the provided options.
     */
    public open(options: IGameClientOptions): Promise<this> {
        return this.discovery
        .retrieveEndpoints(options.discoveryUrl)
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

    /**
     * Creates instructs the server to create new controls on a scene within your project.
     * Participants will see the new controls automatically if they are on the scene the
     * new controls are added to.
     */
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

    /**
     * Instructs the server to create new groups with the specified parameters.
     */
    public createGroups(groups: IGroupDataArray): Promise<IGroupDataArray> {
        return this.execute('createGroups', groups, false);
    }

    /**
     * Instructs the server to create a new scene with the specified parameters.
     */
    public createScene(scene: ISceneData): Promise<ISceneData> {
        return this.createScenes({ scenes: [ scene ] })
        .then(scenes => {
            return scenes.scenes[0];
        });
    }

    /**
     * Instructs the server to create new scenes with the specified parameters.
     */
    public createScenes(scenes: ISceneDataArray): Promise<ISceneDataArray> {
        return this.execute('createScenes', scenes, false);
    }

    /**
     * Updates a sessions' ready state, when a client is not ready participants cannot
     * interact with the controls.
     */
    public ready(isReady: boolean = true): Promise<void> {
        return this.execute('ready', { isReady }, false);
    }

    /**
     * Instructs the server to update controls within a scene with your specified parameters.
     * Participants on the scene will see the controls update automatically.
     */
    public updateControls(params: ISceneData): Promise<void> {
        return this.execute('updateControls', params, false);
    }

    /**
     * Instructs the server to update the participant within the session with your specified parameters.
     * Participants within the group will see applicable scene changes automatically.
     */
    public updateGroups(groups: IGroupDataArray): Promise<IGroupDataArray> {
        return this.execute('updateGroups', groups, false);
    }

    /**
     * Instructs the server to update a scene within the session with your specified parameters.
     */
    public updateScenes(scenes: ISceneDataArray): Promise<void> {
        return this.execute('updateScenes', scenes, false);
    }

    /**
     * Instructs the server to update the participant within the session with your specified parameters.
     */
    public updateParticipants(participants: IParticipantArray): Promise<void> {
        return this.execute('updateParticipants', participants, false);
    }

    /**
     * Makes an attempt to capture a spark transaction and deduct the sparks from the participant
     * who created the transaction.
     *
     * A transaction can fail to capture if:
     *  * The participant does not have enough sparks.
     *  * The transaction is expired.
     */
    public captureTransaction(transactionID: string): Promise<void> {
        return this.execute('capture', { transactionID }, false);
    }

    /**
     * Instructs the server to delete the provided controls.
     */
    public deleteControls(data: ISceneControlDeletion): Promise<void> {
        return this.execute('deleteControls', data, false);
    }

    /**
     * Instructs the server to delete the provided group.
     */
    public deleteGroup(data: IGroupDeletionParams): Promise<void> {
        return this.execute('deleteGroup', data, false);
    }

    /**
     * Instructs the server to delete the provided scene.
     */
    public deleteScene(data: ISceneDeletionParams): Promise<void> {
        return this.execute('deleteScene', data, false);
    }
}
