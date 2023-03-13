# Helpers

Upfront exports some helper functions that are utilities for your development and/or stylistic choice of how you interact with upfront.

**Table of content**
[[toc]]

## String

Upfront provides some helper methods to help manipulate strings. All of these are also available on the `String.prototype` if you choose to include the helper files in your script and if you have not already defined the same methods.
The helper can be reached at:

<CodeGroup>
<CodeGroupItem title="Javascript">
```js
import '@upfrontjs/framework/string.min.js';
// or
import '@upfrontjs/framework/string.es.min.js';
```
</CodeGroupItem>

<CodeGroupItem title="Typescript">
```ts
import '@upfrontjs/framework/src/string';
```
</CodeGroupItem>
</CodeGroup>


The signature of the methods on the `String.prototype` methods matches the below, except the first argument can be omitted as that is taken from the context. For example:

<CodeGroup>

<CodeGroupItem title="String.prototype">
```js
'The quick brown fox jumps over the lazy dog.'.after('over ').before('.').plural().ucFirst().finish('?'); // 'The lazy dogs?'
```
</CodeGroupItem>
<CodeGroupItem title="Helper methods">

```js
import { after, before, plural, ucFirst, finish } from '@upfrontjs/framework/string.min.js';

finish(ucFirst(plural(before(after('The quick brown fox jumps over the lazy dog.', 'over '), '.'))), '?'); // 'The lazy dogs?'
```

</CodeGroupItem>
</CodeGroup>

#### ucFirst

The `ucFirst` method sets the first character the given string to uppercase. 
```js
import { ucFirst } from '@upfrontjs/framework';

ucFirst('string'); // 'String'
```

#### title

The `title` method turns the given string to Title Case. 
```js
import { title } from '@upfrontjs/framework';

title('someRandom string'); // Some Random String
```

#### finish

The `finish` method ensures that the given string ends with the given token. 
```js
import { finish } from '@upfrontjs/framework';

finish('string', '!'); // 'string!'
finish('string!', '!'); // 'string!'
```

#### start

The `start` method ensures that the given string starts with the given token. 
```js
import { start } from '@upfrontjs/framework';

start('string', 'is '); // 'is string'
start('is string', 'is '); // 'is string'
```

#### camel

The `camel` method turns the given string into camelCase.
```js
import { camel } from '@upfrontjs/framework';

camel('String value'); // 'stringValue'
```

#### snake

The `snake` method turns the given string into snake_case.
```js
import { snake } from '@upfrontjs/framework';

snake('String value'); // 'string_value' 
```

#### kebab

The `kebab` method turns the given string into kebab-case.
```js
import { kebab } from '@upfrontjs/framework';

kebab('String value'); // 'string-value'
```

#### plural

The `plural` method pluralises the given string.
```js
import { plural } from '@upfrontjs/framework';

plural('car'); // 'cars'
plural('goose'); // geese
```

#### singular

The `singular` method returns the singular form of the given string.
```js
import { singular } from '@upfrontjs/framework';

singular('cars'); // car
singular('geese'); // goose
```

#### before

The `before` method returns part of the string before the given token. If the given token is not found or is an empty string `''` or the string starts with the token, then it returns an empty string.
```js
import { before } from '@upfrontjs/framework';

before('string', 'r'); // 'st'
before('string', 'not found token'); // ''
before('string', ''); // ''
before('string', 's'); // ''
```

#### beforeLast

The `beforeLast` method returns the part of the given string before the last occurrence of the given token. If the given token is not found or is an empty string `''` or the string starts with the token and is the last occurrence, then it returns an empty string.
```js
import { beforeLast } from '@upfrontjs/framework';

beforeLast('this is a string', 't'); // 'this is a s'
beforeLast('string', 'not found token'); // ''
beforeLast('string', ''); // ''
beforeLast('string', 's'); // ''
```

#### after

The `after` method returns part of the given string after the first occurrence of the given token. If the given token is not found or is an empty string `''` or the string ends with the token and is the first occurrence, then it returns an empty string.
```js
import { after } from '@upfrontjs/framework';

after('string', 'n'); // 'g'
after('string', ''); // ''
after('string', 'g'); // ''
after('string', 'not found token'); // ''
```

#### afterLast

The `afterLast` method returns part of the given string after the last occurrence of the given token. If the given token is not found or is an empty string `''` or the string ends with the token, then it returns an empty string.
```js
import { afterLast } from '@upfrontjs/framework';

afterLast('this is a string', 't'); // 'ring'
afterLast('this is a string', ''); // ''
afterLast('this is a string', 'g'); // ''
afterLast('this is a string', 'not found token'); // ''
```

#### pascal

The `pascal` method turns the given string into PascalCase.
```js
import { pascal } from '@upfrontjs/framework';

pascal('someValue'); // 'SomeValue'
```

#### limit

The `limit` method limits the given string ti the specified length and appends it with a string.
```js
import { limit } from '@upfrontjs/framework';

limit('The quick brown fox jumps over the lazy dog', 9); // 'The quick...'
limit('The quick brown fox jumps over the lazy dog', 9, ' {...}'); // 'The quick {...}'
```

#### words

The `words` method limits the given string to the specified number of words and appends it with a string.
```js
import { words } from '@upfrontjs/framework';

words('The quick brown fox jumps over the lazy dog', 3); // 'The quick brown...
words('The quick brown fox jumps over the lazy dog', 3, ' {...}'); // 'The quick brown {...}
```

#### is

The `is` method determines whether the given string matches the given pattern. The pattern can be a string, a string using glob patten or a `RegExp`. The method accepts a third boolean argument which is to whether ignore letter casing or not when the second argument is a string.
```js
import { is } from '@upfrontjs/framework';

is('The quick brown fox jumps over the lazy dog', 'The quick*'); // true
is('The quick brown fox jumps over the lazy dog', new RegExp(/jumps/)); // true
is('The quick brown fox jumps over the lazy dog', 'the quick*', true); // true
```

#### includesAll

The `includesAll` method determines whether all tokens are included in the given string.
```js
import { includesAll } from '@upfrontjs/framework';

includesAll('The quick brown fox jumps over the lazy dog', ['fox', 'jumps', 'dog']); // true
```



#### uuid

The `uuid` method generates a version 4 universally unique identifier.
```js
import { uuid } from '@upfrontjs/framework';

uuid(); // '971cde1c-2429-4846-bfa7-e62ff5d65363'
```

::: warning
Given this is used for generating string, as such isn't available on the `String.prototype` but on the `String` constructor. Therefore, you may use it as `String.uuid()`.
:::

#### isUuid

The `isUuid` method determines whether the given value is a UUID.
```js
import { isUuid } from '@upfrontjs/framework';

isUuid('380f4ac6-1463-4024-8d53-78da9ad0756c') // true
```

::: tip
`isUuid` is as also available on the `String` constructor to be consistent with the [`uuid`](#uuid) method.
```js
String.isUuid('value') // false
```
:::

## Array

Upfront provides a couple of helper methods to help work with arrays. These methods are also available on the `Array.prototype` and/or the `Array` constructor if you choose to include helper file in your script and if not already defined any of them. The helper can be reached at:

<CodeGroup>
<CodeGroupItem title="Javascript">
```js
import '@upfrontjs/framework/array.min.js';
// or
import '@upfrontjs/framework/array.es.min.js';
```
</CodeGroupItem>

<CodeGroupItem title="Typescript">
```ts
import '@upfrontjs/framework/src/array';
```
</CodeGroupItem>
</CodeGroup>

#### collect

The `collect` method returns a [Collection](./collection.md) instance.
```js
import { collect } from '@upfrontjs/framework';

collect([1, 2, 3, 4, 5]); // Collection
```

#### paginate

The `paginate` method returns a [Paginator](./pagination.md) instance. The arguments match the Paginator's constructor signature.
```js
import { paginate } from '@upfrontjs/framework';

paginate([1, 2, 3, 4, 5], 5, true); // Paginator
```

#### wrap

The `wrap` method ensures that the given value is an array.
If the helper file is included this method is available on the `Array` constructor not the prototype. 
```js
import { wrap } from '@upfrontjs/framework';

wrap(1); // [1]
wrap([1]); // [1]
wrap(); // []
```

## Function

#### factory

The `factory` method returns a [FactoryBuilder](../testing/readme.md#factorybuilder). It first takes a [model](../calliope/readme.md) constructor and optionally an `amount` argument which is the equivalent of the `times` method on the [FactoryBuilder](../testing/readme.md#factorybuilder).
```js
import { factory } from '@upfrontjs/framework';
import User from '@/Models/User';

const userModelCollection = factory(User, 5).make(); // ModelCollection
```

#### collect

The `collect` method returns a [Collection](./collection.md) instance with the passed in items.
```js
import { collect } from '@upfrontjs/framework';

const numberCollection = collect([1, 2, 3, 4, 5]); // Collection
```

#### paginate

The `paginate` method returns a [Paginator](./pagination.md) instance with the passed in items.
```js
import { paginate } from '@upfrontjs/framework';

const paginator = paginate([1, 2, 3, 4, 5]); // Paginator
```

#### isObjectLiteral

The `isObjectLiteral` is a helper function to evaluate that the passed in argument is a non-null object literal `{}`.

```js
import { paginate } from '@upfrontjs/framework';

isObjectLiteral({}); // true
```

#### isUserLandClass

The `isUserLandClass` is a helper to evaluate that the passed in argument is a class constructor defined in the script, which can be used with the `new` keyword.

```js
import { isUserLandClass } from '@upfrontjs/framework';

isUserLandClass(class C {}); // true
```

::: warning
This only returns true for classes that are not built-ins, e.g.: `isUserLandClass(Array)` will be false.
:::

#### transformKeys

The `transformKeys` method recursively transforms the keys of the given object. to the given casing. The first argument is the object to transform, the second argument is the casing (`'camel'` | `'snake'`) to transform to (default: `'camel'`). This will **not** transform classes and built in methods  (eg.: `toString()` won't become `to_string()`).

```js
import { transformKeys } from '@upfrontjs/framework';

const obj = {
    nestedObjects: [
        { my_key: 1 }
    ],
    my_key: 2
};

transformKeys(obj); // { nestedObjects: [{ myKey: 1 }], myKey: 2 };
```

#### retry

The `retry` method is a helper to retry a promise function a number of times if the promise rejects. The function takes 3 arguments:
 - `fn` - The function to retry
 - `maxRetries` (default: 3) - The number of times to retry.
 - `delay` (default: 0) - The delay in milliseconds between retries. If the delay has been set to `0`, the function will run again as soon as the promise rejects. This could also be a function that accepts the current retry count and returns the delay.

```js
import { retry } from '@upfrontjs/framework';
import User from '@/Models/User';

// Retry the function `User.get()` 3 times with a delay of 1 second between each retry. Therefore, sending off 4 (initial + retries) requests in total.
const user = retry(async () => User.find(1), 3, 1000)
    .catch(() => {
        console.log('We really can\'t find the user.');
    });

// Retry the function with progressively longer delays.
const user2 = retry(User.all, 3, attemptNumber => attemptNumber * 1000);
```

#### dataGet

The `dataGet` is a helper method to safely access any path within an object or array. If the path does not exist, it will return the default value (default: `undefined`). Optionally the path may include a wildcard `*` to match array elements.

```js
import { dataGet } from '@upfrontjs/framework';
import Team from '~/Models/Team';
import User from '~/Models/User';
import Shift from '~/Models/Shift';

const complexStructure = Team.factory().with(
    User.factory().with(Shift.factory().attributes({ id: 1 }))
).createMany();

dataGet(complexStructure, '0.users.0.shifts.0.id') === 1; // true

const objectMatrix = [
    [{ id: 1 }, { id: 2 }],
    [{ id: 3 }, { id: 4 }]
]
dataGet(objectMatrix, '*.*.id'); // [1, 2, 3, 4]
dataGet(objectMatrix, '*.*.name', []); // []
```

#### value

The `value` is a function that simply resolves the given argument. If function given it will call the function with the passed in parameters. If not function given, it will return the value.

```ts
import { value } from '@upfrontjs/framework';

value({}); // {};
value(true); // true;
value(() => []); // []
value(
    (firstNum: number, secondNum: number) => firstNum + secondNum,
    1,
    1
); // 2
```
