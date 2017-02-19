import { EventEmitter } from 'events';

import { ClockSync } from '../ClockSync';
import { InteractiveError } from '../errors';
import { IClient } from '../IClient';
import { MethodHandlerManager } from '../methods/MethodHandlerManager';
import { Method, Reply } from '../wire/packets';
import { IControl } from './interfaces/controls/IControl';
import { ISceneData } from './interfaces/IScene';
import { Scene } from './Scene';
import { StateFactory } from './StateFactory';

export class State extends EventEmitter {
    public groups: any;
    public isReady: boolean;
    private methodHandler = new MethodHandlerManager();
    private stateFactory = new StateFactory();
    private scenes = new Map<string, Scene>();

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
    public processMethod(method: Method<any>): void | Reply {
        try {
            return this.methodHandler.handle(method);
        } catch (e) {
            if (e instanceof InteractiveError.Base) {
                return Reply.fromError(method.id, e);
            }
            throw e;
        }
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
            targetScene.destroy();
            this.scenes.delete(sceneID);
            this.emit('sceneDeleted', sceneID, reassignSceneID);
        }
    }

    public addScene(data: ISceneData) {
        const scene = this.stateFactory.createScene(data);
        this.scenes.set(data.sceneID, scene);
        this.emit('sceneCreated', scene);
    }

    public getScene(id: string): Scene {
        return this.scenes.get(id);
    }

    public getControl(id: string): IControl {
        let result: IControl;
        this.scenes.forEach(scene => {
            result = scene.getControl(id);
        });
        return result;
    }
}
