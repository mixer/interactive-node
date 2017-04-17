# Beam Interactive Node 2

A TypeScript, NodeJS and Browser compatible client for Beam.pro's interactive 2 Protocol.

## Installation
You can use npm(recommended) or download a zip from the [releases page](https://github.com/WatchBeam/beam-interactive-node2/releases).

### Browser

```html
<script src="dist/interactive.js"></script>
```

### Node
```
npm i --save beam-interactive-node2
```
## Usage
### Browser

#### index.html
```html
<doctype html>
<html>
    <head>
        <title>Interactive 2</title>
    </head>
    <body>
        <script src="js/interactive.js"></script>
        <script src="js/app.js"></script>
    </body>
</html>
```

#### app.js
```js
const client = new interactive.GameClient();

client.open({
    authToken: '<OAuth Token>',
    url: '<Server Url>',
    versionId: 1234,
});
```
### Node

#### JavaScript
```js
const interactive = require('beam-interactive-node2');
const ws = require('ws');

interactive.setWebSocket(ws);

const client = new interactive.GameClient();

client.open({
    authToken: '<OAuth Token>',
    url: '<Server Url>',
    versionId: 1234,
});
```

#### TypeScript
```ts
import { GameClient, setWebSocket } from 'beam-interactive-node2';
import * as ws from 'ws';

setWebSocket(ws);

const client = new GameClient();

client.open({
    authToken: '<OAuth Token>',
    url: '<Server Url>',
    versionId: 1234,
});
```


