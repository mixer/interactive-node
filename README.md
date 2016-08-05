# Carina

## Installation

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
var ca = new carina.Carina();
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

let ca = new Carina();
ca.subscribe('channel:1:update', data => {
    console.log('Channel update', data);
});
```

#### TypeScript
```ts
import { Carina } from 'carina';
import * as ws from 'ws';

Carina.WebSocket = ws;

let ca = new Carina();
ca.subscribe('channel:1:update', data => {
    console.log('Channel update', data);
});
```
