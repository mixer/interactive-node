import { IJSON, JSONPrimitive } from '../../../interfaces';
import { ETag } from './';

/**
 * An IMeta property is one property within an IMeta map.
 * It contains a value and an Etag.
 */
export interface IMetaProperty {
    value: IJSON | JSONPrimitive;
    etag?: ETag;
}

/**
 * Meta is a map of custom property names. Each custom property has a value
 * and an etag.
 * The values can be any valid JSON type.
 *
 * Meta properties allow you to store custom Metadata on their attached interactive
 * state element.
 */
export interface IMeta {
    [property: string]: IMetaProperty;
}
