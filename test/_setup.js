const chai = require('chai');

chai.use(require('chai-subset'));
chai.use(require('sinon-chai'));
require('../lib/socket').InteractiveSocket.WebSocket = require('ws');

global.sinon = require('sinon');
global.expect = chai.expect;
global.assert = chai.assert;
