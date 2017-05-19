# Planned Features
- [ ] GZIP Compression
- [X] Endpoint discovery
- [ ] Complete group management
- [ ] Dynamic scene creation
- [ ] Server side throttle settings

# Protocol Support
A list of all protocol level methods and this client's support of them. Used to track protocol level support.
## Methods
### GameClient Methods
- [X] ready
- [ ] getMemoryStats

- [ ] getAllParticipants
- [ ] getActiveParticipants
- [x] updateParticipants

- [x] createGroups
- [x] updateGroups

- [x] createScenes
- [ ] deleteScene
- [x] updateScenes

- [X] createControls
- [X] deleteControls
- [X] updateControls

- [X] capture

### Shared Methods
- [X] getTime - on another branch
- [X] getScenes
- [X] setCompression

### Paticipant Methods
- [X] giveInput
- [X] onReady

### Events
- [ ] issueMemoryWarning
- [X] onReady
- [X] onParticipantJoin
- [X] onParticipantLeave
- [X] onParticipantUpdate
- [X] onSceneCreate
- [X] onSceneDelete
- [X] onSceneUpdate
- [X] onControlCreate
- [X] onControlDelete
- [X] onControlUpdate
- [X] onGroupCreate
- [X] onGroupUpdate
- [X] onGroupDelete

