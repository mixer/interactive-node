import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';

import { ClientType } from '../Client';
import { Method } from '../wire/packets';
import { Group } from './Group';
import { IControl } from './interfaces/controls/IControl';
import {
    IGroup,
    IGroupDataArray,
    IGroupDeletionParams,
} from './interfaces/IGroup';
import { ISceneDataArray } from './interfaces/IScene';
import { State } from './State';

function loadFixture(name: string): ISceneDataArray {
    return JSON.parse(fs.readFileSync(name).toString());
}

const groupsFixture: IGroupDataArray = {
    groups: [
        {
            groupID: 'default',
            sceneID: 'my awesome scene',
        },
        {
            groupID: 'deleatable',
            sceneID: 'my awesome scene',
        },
    ],
};
describe('state', () => {
    let state: State;

    function initializeState(fixture: string) {
        state = new State(ClientType.GameClient);
        const data = loadFixture(
            path.join(__dirname, '../../test/fixtures', fixture),
        );
        state.processMethod(
            new Method('onSceneCreate', { scenes: data.scenes }),
        );
        state.processMethod(
            new Method('onGroupCreate', { groups: groupsFixture.groups }),
        );
    }

    describe('initialization', () => {
        it('initializes state from an initial scene list', () => {
            initializeState('testGame.json');
            const scene = state.getScene('my awesome scene');
            expect(scene).to.exist;
        });
    });
    describe('scenes', () => {
        before(() => {
            initializeState('testGame.json');
        });
        it('finds a scene by id', () => {
            const targetScene = 'my awesome scene';
            const scene = state.getScene(targetScene);
            expect(scene).to.exist;
            expect(scene.sceneID).to.be.equal(targetScene);
        });
        it('initializes a scene from a method', () => {
            const method = new Method('onSceneCreate', {
                scenes: [
                    {
                        sceneID: 'scene2',
                        controls: [
                            {
                                controlID: 'button2',
                                kind: 'button',
                                text: 'Win the Game',
                                cost: 0,
                                progress: 0.25,
                                disabled: false,
                                meta: {
                                    glow: {
                                        value: {
                                            color: '#f00',
                                            radius: 10,
                                        },
                                    },
                                },
                            },
                        ],
                    },
                ],
            });
            state.processMethod(method);
            const scene = state.getScene('scene2');
            expect(scene).to.exist;
            expect(scene.sceneID).to.equal('scene2');
            const controlInScene = scene.getControl('button2');
            expect(controlInScene).to.exist;
            expect(controlInScene.controlID).to.equal('button2');
        });
        it('deletes a scene', () => {
            const method = new Method('onSceneDelete', {
                sceneID: 'scene2',
                reassignSceneID: 'my awesome scene',
            });
            state.processMethod(method);
            const scene = state.getScene('scene2');
            expect(scene).to.not.exist;
        });
        it('updates a scene', () => {
            const meta = {
                glow: {
                    value: {
                        color: '#f00',
                        radius: 10,
                    },
                },
            };
            const method = new Method('onSceneUpdate', {
                scenes: [
                    {
                        sceneID: 'my awesome scene',
                        meta: meta,
                    },
                ],
            });
            state.processMethod(method);
            const scene = state.getScene('my awesome scene');
            expect(scene).to.exist;
            expect(scene.meta).to.deep.equal(meta);
        });
    });

    describe('participants', () => {
        it('adds participants', () => {
            state.processMethod(
                new Method(
                    'onParticipantJoin',
                    {
                        participants: [
                            {
                                sessionID: 'abc123',
                                username: 'connor',
                                userID: 1337,
                            },
                        ],
                    },
                    false,
                ),
            );
            expect(state.getParticipantBySessionID('abc123').username).to.equal(
                'connor',
            );
            expect(state.getParticipantByUsername('connor').sessionID).to.equal(
                'abc123',
            );
        });
    });

    describe('controls', () => {
        let control: IControl;
        before(() => {
            initializeState('testGame.json');
        });
        it('finds a control by id', () => {
            const targetControl = 'win_the_game_btn';
            control = state.getControl(targetControl);
            expect(control).to.exist;
            expect(control.controlID).to.be.equal(targetControl);
        });
        it('applies an update to a control', done => {
            control = state.getControl('win_the_game_btn');
            expect(control).to.exist;
            control.on('updated', () => {
                expect(control.disabled).to.equal(
                    true,
                    'expect control to be disabled',
                );
                done();
            });
            state.processMethod(
                new Method('onControlUpdate', {
                    sceneID: 'my awesome scene',
                    controls: [
                        {
                            controlID: 'win_the_game_btn',
                            disabled: true,
                        },
                    ],
                }),
            );
        });
        it('creates and places a new control within the state tree', () => {
            state.processMethod(
                new Method('onControlCreate', {
                    sceneID: 'my awesome scene',
                    controls: [
                        {
                            controlID: 'lose_the_game_btn',
                            kind: 'button',
                            text: 'Lose the Game',
                            cost: 0,
                            progress: 0.25,
                            disabled: false,
                            meta: {
                                glow: {
                                    value: {
                                        color: '#f00',
                                        radius: 10,
                                    },
                                },
                            },
                        },
                    ],
                }),
            );
            control = state
                .getScene('my awesome scene')
                .getControl('lose_the_game_btn');
            expect(control).to.exist;
            expect(control.controlID).to.equal('lose_the_game_btn');
        });
        it('deletes a control', done => {
            const scene = state.getScene('my awesome scene');
            // TODO How do we overload this?
            scene.on('controlDeleted', (id: string) => {
                expect(id).to.equal('lose_the_game_btn');
                const searchControl = scene.getControl(id);
                expect(searchControl).to.not.exist;
                done();
            });
            state.processMethod(
                new Method('onControlDelete', {
                    sceneID: 'my awesome scene',
                    controls: [
                        {
                            controlID: 'lose_the_game_btn',
                        },
                    ],
                }),
            );
        });
    });
    describe('groups', () => {
        let group: IGroup;
        before(() => {
            initializeState('testGame.json');
        });
        it('finds a group by ID', () => {
            const targetGroup = groupsFixture.groups[0].groupID;
            group = state.getGroup(targetGroup);
            expect(group).to.exist;
            expect(group.groupID).to.be.equal(targetGroup);
        });
        it('applies an update to a group', done => {
            const targetScene = 'existing second scene';
            group = state.getGroup(groupsFixture.groups[0].groupID);
            expect(group).to.exist;
            group.on('updated', () => {
                expect(group.sceneID).to.equal(targetScene);
                done();
            });
            state.processMethod(
                new Method('onGroupUpdate', {
                    groups: [
                        {
                            groupID: group.groupID,
                            sceneID: targetScene,
                        },
                    ],
                }),
            );
        });
        it('creates a new group and adds it to state tree', done => {
            const targetGroup: IGroupDataArray = {
                groups: [
                    {
                        groupID: 'a new group',
                        sceneID: 'my awesome scene',
                    },
                ],
            };
            state.on('groupCreated', (newGroup: Group) => {
                expect(newGroup).to.exist;
                expect(newGroup.groupID).to.be.equal(
                    targetGroup.groups[0].groupID,
                );
                done();
            });
            state.processMethod(new Method('onGroupCreate', targetGroup));
            group = state.getGroup(targetGroup.groups[0].groupID);
            expect(group).to.exist('Group', 'new group should exist');
            expect(group.groupID).to.be.equal(
                targetGroup.groups[0].groupID,
                'should have the created group id',
            );
        });
        it('deletes a group', done => {
            const targetGroup = groupsFixture.groups[1].groupID;
            const delGroup = state.getGroup(targetGroup);
            const delGroupParams: IGroupDeletionParams = {
                groupID: delGroup.groupID,
                reassignGroupID: groupsFixture.groups[0].groupID,
            };
            state.on('groupDeleted', (id: string, reassignId: string) => {
                expect(id).to.equal(targetGroup);
                expect(reassignId).to.equal(delGroupParams.reassignGroupID);
                group = state.getGroup(targetGroup);
                expect(group).to.not.exist;
                done();
            });
            state.processMethod(new Method('onGroupDelete', delGroupParams));
        });
    });
});
