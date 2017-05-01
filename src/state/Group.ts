import { EventEmitter } from 'events';

import { merge } from '../merge';
import { IMeta } from './interfaces/controls';
import { IGroup } from './interfaces/IGroup';

/**
 * A Group is a collection of participants.
 */
export class Group extends EventEmitter implements IGroup {
    public groupID: string;
    public sceneID: string;
    public etag: string;
    public meta: IMeta = {};

    constructor(group: IGroup) {
        super();
        merge(this, group);
    }

    // TODO: group management, rather than read-only views

    /**
     * Updates this group with new data from the server.
     */
    public update(data: IGroup) {
        merge(this, data);
        this.emit('updated', this);
    }

    public destroy(): void {
        this.emit('deleted', this);
    }
}
