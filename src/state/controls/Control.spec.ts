import { expect, use } from 'chai';
import * as sinon from 'sinon';

import { Client, ClientType } from '../../Client';
import { IButtonUpdate } from '../interfaces/controls';
import { Scene } from '../Scene';
import { Button } from './';

// tslint:disable-next-line:no-require-imports no-var-requires
use(require('sinon-chai'));

const buttonData = {
    controlID: '0',
    etag: '1234',
};

describe('control', () => {
    let control: Button;
    let mockClient: Client;
    let scene;

    before(() => {
        mockClient = new Client(ClientType.GameClient);
    });

    beforeEach(() => {
        scene = new Scene({ sceneID: 'default', controls: [] });
        control = new Button(buttonData);
        control.setScene(scene);
        control.setClient(mockClient);
    });

    it('lets you update attributes', () => {
        const buttonDiff = {
            text: 'bar',
        };
        const updatedButton = Object.assign({}, buttonData, buttonDiff);
        const stub = sinon.stub(mockClient, 'updateControls');
        control.setText('bar');
        expect(stub).to.be.calledWith({
            sceneID: 'default',
            controls: [updatedButton],
        });
        stub.restore();
    });

    it('lets you update cost', () => {
        const buttonDiff = {
            cost: 200,
        };
        const updatedButton = Object.assign({}, buttonData, buttonDiff);
        const stub = sinon.stub(mockClient, 'updateControls');
        control.setCost(buttonDiff.cost);
        expect(stub).to.be.calledWith({
            sceneID: 'default',
            controls: [updatedButton],
        });
        stub.restore();
    });

    it('allows batch updates', () => {
        const buttonDiff: IButtonUpdate = {
            cost: 200,
            text: 'foobar',
        };
        const updatedButton = {
            etag: buttonData.etag,
            controlID: buttonData.controlID,
            ...buttonDiff,
        };
        const stub = sinon.stub(mockClient, 'updateControls');
        control.update(buttonDiff);
        expect(stub).to.be.calledWith({
            sceneID: 'default',
            controls: [updatedButton],
        });
        stub.restore();
    });
});
