# Beam Interactive Node 2

A TypeScript, NodeJS and Browser compatible client for Beam.pro's interactive 2 Protocol.

## Installation
You can use npm(recommended) or download a zip from the [releases page](https://github.com/WatchBeam/beam-interactive-node2/releases).

### Browser

```html
<script src="dist/carina.js"></script>
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
        <script src="js/carina.js"></script>
        <script src="js/app.js"></script>
    </body>
</html>
```

#### app.js
```js
var ca = new carina.Carina().open();
ca.subscribe('channel:1:update', function (data) {
    console.log('Channel update', data);
});
```
### Node

#### JavaScript
```js
const Carina = require('carina').Carina;
const ws = require('ws');

Carina.WebSocket = ws;

// Note: You MUST set isBot if the client is
// an automated bot and you are NOT authing.
const ca = new Carina({ isBot: true }).open();
ca.subscribe('channel:1:update', data => {
    console.log('Channel update', data);
});
```

#### TypeScript
```ts
import { Carina } from 'carina';
import * as ws from 'ws';

Carina.WebSocket = ws;

const ca = new Carina({ isBot: true }).open();
ca.subscribe<ChannelUpdate>('channel:1:update', data => {
    console.log('Channel update', data);
});

// Example interface, does not contain all possible values.
interface ChannelUpdate {
    online?: boolean;
}
```


