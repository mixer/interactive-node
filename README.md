# Interactive Node

[![Build Status](https://travis-ci.org/mixer/interactive-node.svg?branch=master)](https://travis-ci.org/mixer/interactive-node)

A TypeScript, Node.js and Browser(JavaScript) compatible client for [Mixer.com's interactive 2 Protocol](https://dev.mixer.com/reference/interactive/protocol/protocol.pdf).

For an introduction to interactive2 checkout the [reference docs](https://dev.mixer.com/reference/interactive/index.html) on the developers site.

## Installation

You can use npm(recommended) or download a zip from the [releases page](https://github.com/mixer/interactive-node/releases).

### Browser

```html
<script src="dist/interactive.js"></script>
```

### Node

```
npm i --save beam-interactive-node2
```

## Usage

### Authentication

[OAuth 2.0](https://tools.ietf.org/html/rfc6749) is used for authentication. Valid bearer tokens can be passed in the [Client.open](https://mixer.github.io/interactive-node/classes/client.html#open) method.

For more information about Mixer's OAuth visit the [OAuth reference page](https://dev.mixer.com/reference/oauth/index.html) on our developer site.

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
    versionId: 1234,
});
```

## Examples

Checkout our [examples](examples/) to get up to speed quickly!

* [basic](examples/basic.ts) - Connects and sets up 5 buttons, when they are clicked the participant is charged 1 spark.
* [dynamicControls](examples/dynamicControls.ts) - Connects and then creates and destroys 5 buttons with random text.
* [joystick](examples/joystick.ts) - Connects and creates a joystick, logs participant coordinate values.

Using Node.js? Clone this repository and run `npm run build` and the examples will be converted to JavaScript for you!

## Documentation

Checkout our reference docs [here](https://mixer.github.io/interactive-node/).

## Development

To get a development environment setup:

1. [Clone this repository](https://help.github.com/articles/cloning-a-repository/)
1. `npm install`
1. `npm run build`

### Contributing

Thanks for your interested in contributing, checkout [TODO.md](TODO.md) for a list of tasks!

Open a [Pull Request](https://github.com/mixer/interactive-node/pulls) we'd love to see your contributions.
