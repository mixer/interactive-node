/**
 * Etags are a synchronization mechanism within interactive.
 * Each time state on a Control, Group, Participant or Scene
 * its ETag is updated.
 *
 * To make a state change the client must send the current ETag,
 * with the request. If the Client's ETag is out of date the
 * request will fail.
 */
export type ETag = string;

export * from './IButton';
export * from './IControl';
export * from './IInput';
export * from './IJoystick';
export * from './IMeta';
