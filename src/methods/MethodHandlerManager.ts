import { InteractiveError } from '../errors';
import { IInputEvent } from '../state/interfaces/controls/IInput';
import { IParticipantArray } from '../state/interfaces/IParticipant';
import { Method, Reply } from '../wire/packets';
import { onReadyParams } from './methodTypes';

import { IGroupDataArray, IGroupDeletionParams } from '../state/interfaces/IGroup';
import { ISceneData, ISceneDataArray, ISceneDeletionParams } from '../state/interfaces/IScene';

export interface IMethodHandler<T> {
    (method: Method<T>) : Reply | void;
}

export class MethodHandlerManager {
    private handlers: {[key: string]: IMethodHandler<any>} = {};

    public addHandler(method: 'onParticipantJoin', handler: IMethodHandler<IParticipantArray>): void;
    public addHandler(method: 'onParticipantLeave', handler: IMethodHandler<IParticipantArray>): void;
    public addHandler(method: 'onParticipantUpdate', handler: IMethodHandler<IParticipantArray>): void;

    public addHandler(method: 'onSceneCreate', handler: IMethodHandler<ISceneDataArray>): void;
    public addHandler(method: 'onSceneDelete', handler: IMethodHandler<ISceneDeletionParams>): void;
    public addHandler(method: 'onSceneUpdate', handler: IMethodHandler<ISceneDataArray>): void;

    public addHandler(method: 'onGroupCreate', handler: IMethodHandler<IGroupDataArray>): void;
    public addHandler(method: 'onGroupDelete', handler: IMethodHandler<IGroupDeletionParams>): void;
    public addHandler(method: 'onGroupUpdate', handler: IMethodHandler<IGroupDataArray>): void;

    public addHandler(method: 'onControlCreate', handler: IMethodHandler<ISceneData>): void;
    public addHandler(method: 'onControlDelete', handler: IMethodHandler<ISceneData>): void;
    public addHandler(method: 'onControlUpdate', handler: IMethodHandler<ISceneData>): void;

    public addHandler(method: 'onReady', handler: IMethodHandler<onReadyParams>): void;

    public addHandler(method: 'giveInput', handler: IMethodHandler<IInputEvent>): void;

    public addHandler<T>(method: string, handler: IMethodHandler<T>): void;
    public addHandler(method: string, handler: IMethodHandler<any>): void {
        this.handlers[method] = handler;
    }

    public removeHandler(method: string) {
        delete this.handlers[method];
    }

    public handle<T>(method: Method<T>): Reply | void {
        if (this.handlers[method.method]) {
            return this.handlers[method.method](method);
        }
        /**
         * When Discard is true a reply is not required,
         * If an error occurs though, we expect the client to tell
         * the server about it.
         *
         * So in the case of a missing method handler, resolve with no reply
         * if discard is true, otherwise throw UnknownMethodName
         */
        if (method.discard) {
            return null;
        }
        throw new InteractiveError.UnknownMethodName(`Client cannot process ${method.method}`);
    }
}
