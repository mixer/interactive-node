# Carina [![Build Status](https://travis-ci.org/WatchBeam/carina.svg?branch=master)](https://travis-ci.org/WatchBeam/carina)

## Installation
You can either use npm (recommended) or download the zip from the [releases page](https://github.com/WatchBeam/carina/releases).

### Browser
```html
<script src="js/carina.js"></script>
```

### Node
```
npm i --save carina
```

## Usage
### Browser

#### index.html
```html
<doctype html>
<html>
    <head>
        <title>Carina</title>
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
