# Changelog

## 1.x

## 1.0.0 Endpoint Discovery **Breaking**

For interactive 2 its important to always retrieve a list of servers from our API before connecting. This used to be up to the implementer. With 1.0.0 we're placing this responsibility inside the client. This should make getting up and running easier.

`client.open` now returns a Promise, which resolves when the connection is open. You should move all logic that previously assumed the connection would open immediately into a promise chain attached to `client.open`.

All of the [examples](examples/) have been updated to reflect this change.

## 0.x

## 0.11.0 Protocol Fixes

This fixes several protocol issues with our initial implementation.

- Correct updateControls structure to allow cool downs and text setting.
- Added ETags to participants
- Fixes State.getControl breaking when there are multiple scenes
- Make .gitignore to ignore all .js files in /examples/
- correct disabled in participants.
