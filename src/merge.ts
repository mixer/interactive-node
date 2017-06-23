import deepmerge = require('deepmerge'); //tslint:disable-line no-require-imports import-name
/**
 * Merges the properties of two objects together, mutating the first object. Similar to lodash's merge.
 */
export function merge<T>(x: T, y: T): T {
    return Object.assign(x, deepmerge(x, y));
}
