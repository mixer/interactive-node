import { EventEmitter } from 'events';
import { ETag } from './';
import { IMeta } from './controls/IMeta';

export interface IGroupDataArray {
    groups: IGroupData[];
}

export interface IGroupDeletionParams {
    groupID: string;
    reassignGroupID: string;
}

export interface IGroupData {
    /**
     * The ID of the group.
     */
    groupID?: string;

    /**
     * The scene the group is currently assigned to.
     */
    sceneID?: string;

    /**
     * Metadata associated with the group.
     */
    meta?: IMeta;

    /**
     * @deprecated etags are no longer used, you can always omit/ignore this
     */
    etag?: ETag;
}

export interface IGroup extends EventEmitter, IGroupData {
    /**
     * Fired when the group is updated with new data from the server.
     */
    on(event: 'updated', listener: (group: IGroup) => void): this;

    /**
     * Fired when this group is deleted.
     */
    on(event: 'deleted', listener: (group: IGroup) => void): this;
    on(event: string, listener: Function): this;
}
