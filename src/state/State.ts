import { EventEmitter } from 'events';
import { pull } from 'lodash';

import { ClockSync } from '../ClockSync';
import { InteractiveError } from '../errors';
import { IClient } from '../IClient';
import { MethodHandlerManager } from '../methods/MethodHandlerManager';
import { only } from '../util';
import { Method, Reply } from '../wire/packets';
import { IControl } from './interfaces/controls/IControl';
import { ISceneData } from './interfaces/IScene';
import { Scene } from './Scene';
import { StateFactory } from './StateFactory';

export class State extends EventEmitter {
    private scenes: Scene[] = [];
    public groups: any;
    public isReady: boolean;
    private methodHandler = new MethodHandlerManager();
    private stateFactory = new StateFactory();
    private client: IClient;

    private clockDelta: number = 0;

    private clockSyncer = new ClockSync({
        sampleFunc: () => this.client.getTime(),
    });

    constructor() {
        super();

        this.methodHandler.addHandler('onReady', readyMethod => {
            this.isReady = readyMethod.params.isReady;
            this.emit('ready', this.isReady);
            return Promise.resolve(null);
        });

        // Scene Events
        this.methodHandler.addHandler('onSceneCreate', res => {
            res.params.scenes.forEach(scene => this.addScene(scene));
        });
        this.methodHandler.addHandler('onSceneDelete', res => {
            this.deleteScene(res.params.sceneID, res.params.reassignSceneID);
        });
        this.methodHandler.addHandler('onSceneUpdate', res => {
            res.params.scenes.forEach(scene => this.updateScene(scene));
        });

        this.methodHandler.addHandler('onControlCreate', res => {
            const scene = this.getScene(res.params.sceneID);
            if (scene) {
                scene.addControls(res.params.controls);
            }
        });

        this.methodHandler.addHandler('onControlDelete', res => {
            const scene = this.getScene(res.params.sceneID);
            if (scene) {
                scene.deleteControls(res.params.controls);
            }
        });

        this.methodHandler.addHandler('onControlUpdate', res => {
            res.params.scenes.forEach(sceneData => {
                const scene = this.getScene(sceneData.sceneID);
                if (scene) {
                    scene.updateControls(sceneData.controls);
                }
            });
        });
        this.clockSyncer.on('delta', (delta: number) => {
            // TODO pass delta into state, that involve times. Just buttons right now?
            this.clockDelta = delta;
        });
    }
    public setClient(client: IClient) {
        this.client = client;
        this.stateFactory.setClient(client);
        this.clockSyncer.start();
    }
    public processMethod(method: Method<any>): Promise<Reply | null> | void {
        const result = this.methodHandler.handle(method);
        if (!result) {
            return;
        }
        return result
            .catch(only(InteractiveError.Base, err => {
                /**
                 * Catch only InteractiveError's and return them as a Reply packet
                 */
                return Reply.fromError(method.id, err);
            }));
    }

    public initialize(scenes: ISceneData[]) {
        scenes.forEach(scene => this.addScene(scene));
    }

    public updateScene(scene: ISceneData) {
        const targetScene = this.getScene(scene.sceneID);
        if (targetScene) {
            targetScene.update(scene);
        }
    }

    public deleteScene(sceneID: string, reassignSceneID: string) {
        const targetScene = this.getScene(sceneID);
        if (targetScene) {
            pull(this.scenes, targetScene);
            targetScene.destroy();
            this.emit('sceneDeleted', targetScene, reassignSceneID);
        }
    }

    public addScene(data: ISceneData) {
        const scene = this.stateFactory.createScene(data);
        this.scenes.push(scene);
        this.emit('sceneCreated', scene);
    }

    public getScene(id: string): Scene {
        return this.scenes.find(scene => scene.sceneID === id);
    }

    public getControl(id: string): IControl {
        let result: IControl;
        this.scenes.forEach(scene => {
            result = scene.getControl(id);
        });
        return result;
    }
}
