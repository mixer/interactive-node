import { IJSON } from '../../../interfaces';

/**
 * An IMeta property is one property within an IMeta map,
 * It is comprised on an etag and a value which can be any Valid JSON type.
 */
export interface IMetaProperty {
    value: IJSON;
    etag: string;
}

/**
 * Meta is a map of custom property names which have etag'ed values.
 * They can be any valid JSON value.
 *
 * They allow you to store custom Metadata on their attached Interactive State Element.
 */
export interface IMeta {
    [property: string]: IMetaProperty;
}
