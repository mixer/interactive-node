# Changelog

## 2.x

### 2.6
- Fixed a couple of housekeeping issues

### 2.5
- Client will now use a round robin strategy when it encounters issues with an interactive server it is trying to connect to (#92)
- Add sharecode support (#86). Thanks @JohnyCilohokla.
- Update package.json links (#90). Thanks @metaa
- Add keyboard events to buttons (#88)

### 2.4
- Added tooltip properties to buttons.
- Removed Etags, these are no longer needed see https://github.com/mixer/developers/issues/160 for more information.
- Authentication changes, we now use stream access keys to connect to interactive for Mixer.com

### 2.3
- Added a list of frontend grid sizes `gridLayoutSizes` (#71)
- Improved typings for control metadata (#82)

### 2.2
- Added `State.getGroups()`, `State.getParticipants()` and `State.getScenes()` (#78)
- Internal project cleanup

### 2.1.0 Bug Fixes and Utility Methods

- Fixed some re-branding issues (#51 #52 #55)
  - Thanks @alfw, @kateract !
- Add an initial state to the socket (#56)
- Add a singular form of `createScenes` called `createScene` which can be used for tidier use cases (#62)
  - Thanks @metaa !
- Added `synchronizeState` which will retrieve `Scenes` and `Groups` from the server (#57)
  - Can be used in the place of two calls to `synchronizeScenes` and `synchronizeGroups`
- Added an `update` method to `Button` and `Joystick` which allows batch updates (#65)
- Added the ability to specify a custom discovery url for internal Mixer developments (#69)

### 2.0.0 Groups and Scenes **Breaking**

With some awesome community contributions we've now added the following features:

- Added `setCost` to Buttons thanks @kateract
- Added methods to manipulate scenes and groups
  - `createGroups`
  - `updateGroups`
  - `createScenes`
  - `updateParticipants`
  - `synchronizeGroups`
  - `getGroups`

#### Breaking Changes

This release includes some minor breaking changes:

- Minor refactor of IGroup* interfaces to align with I, IData, IDataArray pattern used elsewhere.

## 1.x

### 1.0.0 Endpoint Discovery **Breaking**

For interactive 2 its important to always retrieve a list of servers from our API before connecting. This used to be up to the implementer. With 1.0.0 we're placing this responsibility inside the client. This should make getting up and running easier.

`client.open` now returns a Promise, which resolves when the connection is open. You should move all logic that previously assumed the connection would open immediately into a promise chain attached to `client.open`.

All of the [examples](examples/) have been updated to reflect this change.

## 0.x

### 0.11.0 Protocol Fixes

This fixes several protocol issues with our initial implementation.

- Correct updateControls structure to allow cool downs and text setting.
- Added ETags to participants
- Fixes State.getControl breaking when there are multiple scenes
- Make .gitignore to ignore all .js files in /examples/
- correct disabled in participants.
