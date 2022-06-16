# Event Emitter

Event emitter is a singular object that allows for reacting to certain events emitted throughout your app's lifecycle.

::: tip
Events are executed in the order they have been added to the emitter.
:::

## Methods

#### on

The `on` method sets up the listener for an event. It receives two arguments, the first being the event name to listen to, the second being the callback function. The function will receive the same arguments the event was [emitted](#emit) with. The listener will run every time on the event until it is turned [off](#off).

```ts
import { EventEmitter } from '@upfrontjs/framework';
import type { MyEvents } from '../types';

const emitter = EventEmitter.getInstance<MyEvents>();
emitter.on('myEvent', num => num);
emitter.emit('myEvent', 2);
```

#### once

The `once` method works the same way as the [on](#on) method except once the callback runs, it will not run again.

```ts
import { EventEmitter } from '@upfrontjs/framework';
import type { MyEvents } from '../types';

const emitter = EventEmitter.getInstance<MyEvents>();
emitter.once('myEvent', num => console.log(num));
emitter.emit('myEvent', 1); // 1 logged out to the console
emitter.emit('myEvent', 1); // nothing happens
```
#### prependListener

The `prependListener` method works the same way as the [on](#on) method except the listener will be executed before all the other listeners.

```ts
import { EventEmitter } from '@upfrontjs/framework';
import type { MyEvents } from '../types';

const emitter = EventEmitter.getInstance<MyEvents>();
emitter.on('myEvent', num => console.log(num));
emitter.prependListener('myEvent', num => console.log('first log: ', num));
emitter.emit('myEvent', 1); // logged out 'first log: 1', then '1'
```

#### prependOnceListener

The `prependOnceListener` method works the same was as the [prependListener](#prependlistener) except the given callback only runs once like with the [once](#once) method.

#### off

The `off` method removes the callback from the emitter. For variation of behaviour based on arguments, check the example below.

```ts
import { EventEmitter } from '@upfrontjs/framework';
import type { MyEvents } from '../types';

const emitter = EventEmitter.getInstance<MyEvents>();
emitter.off(); // removes all listeners
emitter.off('myEvent'); // removes all listners that run on the given event
emitter.off('myEvent', () => console.log(1)); // removes all the callbacks that binded to the given event and matches the callback signature
emitter.off(undefined, () => console.log(1)); // remove all the callbacks from all the events that match the given callback signature
```

#### emit
The `emit` method triggers the registered callbacks. It optionally accepts a number of arguments to be passed to the callbacks.

```ts
import { EventEmitter } from '@upfrontjs/framework';
import type { MyEvents } from '../types';

const emitter = EventEmitter.getInstance<MyEvents>();
emitter.on('myEvent', num => console.log(num));
emitter.emit('myEvent'); // logs out 'undefined'
emitter.emit('myEvent', 1); // logs out '1'
```
#### has

The `has` method determines whether there are listeners registered. It optionally takes 2 arguments. First the event name to check if any listeners exists, the second a callback to match function signature against.

```ts
import { EventEmitter } from '@upfrontjs/framework';
import type { MyEvents } from '../types';

const emitter = EventEmitter.getInstance<MyEvents>();
emitter.on('myEvent', num => console.log(num));
emitter.has(); // true
emitter.has('myEvent'); // true
emitter.has('otherEvent'); // false
emitter.has('myEvent', () => {}); // false
emitter.has('myEvent', num => console.log(num)); // true
emitter.has(undefined, () => {}); // false
emitter.has(undefined, num => console.log(num)); // true
```
#### listenerCount

The `listenerCount` determines how many listeners are currently registered. If an event name is given only the listeners for the given event are counted.

```ts
import { EventEmitter } from '@upfrontjs/framework';
import type { MyEvents } from '../types';

const emitter = EventEmitter.getInstance<MyEvents>();
emitter.on('myEvent', () => {});
emitter.listenerCount(); // 1
emitter.listenerCount('myEvent'); // 1
emitter.listenerCount('otherEvent'); // 0
```
#### eventNames

The `eventNames` method returns all the event names that are currently listened to.

```ts
import { EventEmitter } from '@upfrontjs/framework';
import type { MyEvents } from '../types';

const emitter = EventEmitter.getInstance<MyEvents>();
emitter.eventNames(); // []
emitter.on('myEvent', () => {});
emitter.once('myEvent', () => {});
emitter.one('otherEvent', () => {});
emitter.eventNames(); // ['myEvent', 'otherEvent']
```
