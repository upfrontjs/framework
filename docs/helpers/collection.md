# Collection

The collection is an object an implementing `ArrayLike` and [Iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) meaning it can be iterated with `for... of` or generators, has a `.length` property, and it can be indexed by numbers `collection[0]`. It implements all method available on the [array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) in a compatible fashion. The collection is immutable unless the methods that are expected to mutate the collection: `push`, `pop`, `unshift`, `shift`, `fill`.

_* Despite feature parity, the type of the collection isn't interchangeable with the array given some methods are returning a collection instead of array, for example `map`._

Instantiating a new collection is easy as:
```js
import { Collection, collect } from '@upfrontjs/framework'

collect([1, 2, 3]);
// or
new Collection([1, 2, 3])
```
The constructor can take a single argument of an item or array of items or no argument.

::: warning
**Note on extending the collection.**

Given the collection is **immutable** it creates a new instance on method calls. If you're extending the collection, and your constructor takes a non-optional nth argument, the inherited methods will not work as it's impossible to tell what extra arguments might be needed.
:::
## Methods

[[toc]]

#### first

The `first` method returns the first element of the collection. Optionally it takes a function to pick the first element by. If the collection is empty, it returns `undefined`.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.first(); // 1

collection.first(number => number > 2); // 3
```

#### last

The `last` method returns the last element in the collection. Optionally it takes a function to pick the last element by. If the collection is empty, it returns `undefined`.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.last(); // 5
collection.first(number => number < 5); // 4
```

#### random

The `random` method returns a random element from the collection. Optionally you may specify the number of random elements to pick. The argument's absolute value is used in case of negative integers.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.random(); // random element 
collection.random(2); // collection of 2 random elements
collection.random(collection.length); // return the whole collection
```

#### isEmpty

The `isEmpty` method determines whether the collection is empty or not.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.isEmpty(); // false
(new Collection).isEmpty(); // true
```

#### isNotEmpty

The `isNotEmpty` method determines whether the collection is not empty or is empty.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.isNotEmpty(); // true
(new Collection).isNotEmpty(); // false
```

#### hasDuplicates

The `hasDuplicates` method determines if there are any duplicates in the collection based on deep equality.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.hasDuplicates(); // false
(new Collection([1, 1])).hasDuplicates(); // true
```

#### unique

The `unique` method de-duplicates the collection based on deep equality. Optionally it takes one argument which is a string or function. On a function argument, the equality will be evaluated based on the function's return value. If the given argument is a string and all items in the collection are objects then if the object's key matching the string it will be based on the value's deep equality.
```js
import { Collection } from '@upfrontjs/framework';

let collection = new Collection([1, 2, 1, 4, 5]);
collection.unique(); // Collection[1, 2, 4, 5]

collection = new Collection([
    { id: 1, name: 'name1' },
    { id: 2, name: 'name2' },
    { id: 3, name: 'name1' },
]);

collection.unique('name'); // Collection[{ id: 1, name: 'name1' },{ id: 2, name: 'name2' }]
collection.unique(obj => object.name); // Collection[{ id: 1, name: 'name1' },{ id: 2, name: 'name2' }]
```

#### duplicates

The `duplicates` method returns only the duplicates from the collection. Optionally it takes one argument which is a string or function. On a function argument, the equality will be evaluated based on the function's return value. If the given argument is a string and all items in the collection are objects then if the object's key matching the string it will be based on the value's deep equality.
```js
import { Collection } from '@upfrontjs/framework';

let collection = new Collection([1, 2, 1, 4, 5]);
collection.duplicates(); // Collection[1]

collection = new Collection([
    { id: 1, name: 'name1' },
    { id: 2, name: 'name2' },
    { id: 3, name: 'name1' }
]);

collection.duplicates('name'); // Collection[{ id: 1, name: 'name1' }]
collection.duplicates(obj => object.name); // Collection[{ id: 1, name: 'name1' }]
```

#### delete

The `delete` method removes all elements that deep equal to the given value;
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.delete(3); // Collection[1, 2, 4, 5]
```

#### nth

The `nth` method returns only every nth item in the collection.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.nth(2); // Collection[2, 4]
```

#### withoutEmpty

The `withoutEmpty` method filters out every `null` and `undefined` values from the collection.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, null, 3, 4, 5, undefined]);
collection.withoutEmpty(); // Collection[1, 2, 3, 4, 5]
```

#### pad

The `pad` method pads the collection to the given length with the given optional value. The value if it's a function, will be called. If the given length is a negative integer the value will be prepended.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3]);
collection.pad(5); // Collection[1, 2, 3, undefined, undefined]
collection.pad(1); // Collection[1, 2, 3]
collection.pad(-5); // Collection[undefined, undefined, 1, 2, 3]
collection.pad(4, 'value'); // Collection[1, 2, 3, 'value']
collection.pad(4, () => 'return value'); // Collection[1, 2, 3, 'return value']
```

#### union

The `union` method joins one or more iterables without overlapping values based on deep equality.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.union(1, [4, 6], new Collection(7)); // Collection[1, 2, 3, 4, 5, 6, 7]
```

#### diff

The `diff` method returns the difference between the collection and the given item or array/collection based on deep equality.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.diff([2, 3, 4, 5, 6]); // Collection[1, 6]
collection.diff(1); // Collection[2, 3, 4, 5]
```

#### intersect

The `intersect` method returns the values that are present in both the collection, and the given value.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.intersect(1); // Colection[1]
collection.intersect(new Collection([3, 4, 5, 6])); // Colection[3, 4, 5]
```

#### chunk

The `chunk` method returns a collection of collections with the given size.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.chunk(2); // Collection[Collection[1, 2], Collection[3, 4], Collection[5]]
collection.chunk(5); // Collection[Collection[1, 2, 3, 4, 5]]
```

#### chunkBy

The `chunkBy` method returns an object where the keys are the resolved key values. The method also accepts a callback function which can be used to chunk by deeply nested key values.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([
    { id: 0, parentId: 5 },
    { id: 1, parentId: 5 },
    { id: 2, parentId: 3 },
    { id: 3, parentId: 3 },
    { id: 4, parentId: 3 }
]);

/**
 * Will result in:
 * {
 *     '5': Collection[{ id: 0, parentId: 5 },{ id: 1, parentId: 5 }],
 *     '3': Collection[{ id: 2, parentId: 3 },{ id: 3, parentId: 3 },{ id: 4, parentId: 3 }],
 * }
 */
collection.chunkBy('parentId');

/**
 * Will result in:
 * {
 *     '5': Collection[{ id: 0, parentId: 5 },{ id: 1, parentId: 5 }],
 *     '3': Collection[{ id: 2, parentId: 3 },{ id: 3, parentId: 3 },{ id: 4, parentId: 3 }],
 * }
 */
collection.chunkBy(item => item.parentKey);
```

#### when

The `when` method executes the given method if the first argument evaluates to true. The method has to return the collection.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.when(true, collectionCopy => collectionCopy.nth(2)); // Collection[2, 4]
collection.when(() => false, collectionCopy => collectionCopy.nth(2)); // Collection[1, 2, 3, 4, 5]
```

#### unless

The `unless` method executes the given method if the first argument evaluates to false. The method has to return the collection.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.unless(false, collectionCopy => collectionCopy.nth(2)); // Collection[2, 4]
collection.unless(() => true, collectionCopy => collectionCopy.nth(2)); // Collection[1, 2, 3, 4, 5]
```

#### whenEmpty

The `whenEmpty` method executes the given method if the collection is empty.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
let count = 0;
collection.whenEmpty(collectionCopy => count++);
count; // 0
(new Collection).whenEmpty(collectionCopy => count++);
count; // 1
```

#### whenNotEmpty

The `whenNotEmpty` method executes the given method when the collection is not empty.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
let count = 0;
collection.whenNotEmpty(collectionCopy => count++);
count; // 1
(new Collection).whenNotEmpty(collectionCopy => count++);
count; // 1
```

#### take

The `take` method returns given number of items. On negative integer, it returns items from the end first.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.take(2); // Collection[1, 2]
collection.take(-2); // Collection[4, 5]
```

#### takeUntil

The `takeUntil` method takes items from the collection until the given function called with the item returns false.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.takeUntil(item => item >= 4); // Collection[1, 2, 3]
```

#### takeWhile

The `takeWhile` method takes items from the collection until the given function called with the item returns true.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.takeWhile(item => item < 4); // Collection[1, 2, 3]
```

#### skip

The `skip` method skips the given number of items in the collection.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.skip(3); // Collection[4, 5]
```

#### skipUntil

The `skipUntil` method skips items until the given function returns false.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.skipUntil(item => item > 2); // Collection[3, 4, 5]
```

#### skipWhile

The `skipWhile` method skips items until the given function returns true.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.skipWhile(item => item <= 2); // Collection[3, 4, 5]
```

#### pluck

When all items in the collections are objects then you may use to The `pluck` method to get certain attributes in a collection or multiple attributes in a collection of objects 
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection(
    { id: 1, name: 'name1', email: 'test1@email.com' },
    { id: 2, name: 'name2', email: 'test2@email.com' },
    { id: 3, name: 'name3', email: 'test3@email.com' },
);
collection.pluck('name'); // Collection['name1', 'name2', 'name3']
collection.pluck(['id', 'name']); // Collection[{ id: 1, name: 'name1' }, { id: 2, name: 'name2' }, { id: 3, name: 'name3' }]
```

#### tap

The `tap` method executes the given function with the collection without changing the collection.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.tap(collectionCopy => collection.take(2)); // Collection([1, 2, 3, 4, 5])
```

#### pipe

The `pipe` method executes the given function with the collection. The function must return the collection.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.pipe(collectionCopy => collection.take(2)); // Collection([1, 2])
```

#### dump

The `dump` method is a debugging function which prints out the collection in its current state to the console. It is chainable. Optionally it can take a message argument.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.dump(); // logged: '10:37:05 - All items: 1,2,3,4,5'
collection.dump('test'); // logged: '10:37:05 (test) - All items: 1,2,3,4,5'
collection.dump().take(2); // Collection[1, 2]
```

#### orderBy

When all items in the collections are objects, then you may order them using the `orderBy` method. The method takes one or more objects describing how the collection should be ordered. The object has two properties:

- `property` - the name of the property you want to order by OR a method that accepts the collection item and returns the nested value.
- `direction` - possible values are `asc`, `desc` respective to whether it should be in ascending or descending order.

```js
const elements = [
    { id: 2, nestedObj: { name: '2' } },
    { id: 1, nestedObj: { name: '5' } },
    { id: 1, nestedObj: { name: '1' } },
    { id: 4, nestedObj: { name: '4' } },
    { id: 3, nestedObj: { name: '3' } }
];

const collection = new Collection(elements);

collection.orderBy(
    { property: 'id', directions: 'asc' },
    { property: element => element.nestedObj.name, direction: 'desc' }
).at(1)!.nestedObj.name === '1'; // true

collection.orderBy(
    { property: element => element.nestedObj.name, direction: 'asc' }
).at(0)!.nestedObj.name === '1'; // true
```

#### toArray

The `toArray` method creates an [array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) from the collection.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.toArray(); // [1, 2, 3, 4, 5]
```

#### toJSON

The `toJSON` method returns the JSON representation of the collection.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.toJSON(); // '{"0":1,"1":2,"2":3,"3":4,"4":5,"length":5}'
```

#### isCollection

The `isCollection` static method is used to evaluate whether the given value is a collection.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
Collection.isCollection(collection); // true
Collection.isCollection(1); // false
```

#### times

The `times` static method is used to create a new collection consisting of the given value with the given number of times. A function may also be passed which will be called with the current iteration (iteration starting at 1).
```js
import { Collection } from '@upfrontjs/framework';

Collection.times(3, 'value'); // Collection['value', 'value', 'value']
Collection.times(3, i => i); // Collection[1, 2, 3]
```

#### forEach

The `forEach` works the same way as the base [forEach](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach), except it is chainable.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2, 3, 4, 5]);
collection.forEach(number => console.log(number)).take(2); // Collection([1, 2])
```

#### includes

The `includes` works the same way as the base [includes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes), except it evaluates based on deep equality.
```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([{ id: 1 }, { id: 2 }]);
collection.include({ id: 2 }); // true
collection.include(2); // false
```

#### join

The `join` method works the same way the base [join](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join), except when using a collection of object the first argument is can be a property key or getter function receiving the object.

```js
import { Collection } from '@upfrontjs/framework';

const collection = new Collection([1, 2]);
collection.join('-'); // '1-2'

const objectCollection = new Collection([{ id: 1 }, { id: 2 }]);
objectCollection.join('id', '-'); // '1-2'
objectCollection.join(obj => obj.id + 1); // '2,3'
```

#### sum

The `sum` method returns the summative the collection numbers while casting strings to numbers if possible otherwise throws an error. Optionally it takes a string for the property key or getter function receiving the item to return a single value.

```js
import { Collection } from '@upfrontjs/framework';

let collection = new Collection([1, 2]);

collection.sum(); // 3

collection = new Collection(['3', '4']);
collection.sum(); // 7

collection = new Collection([{ id: 1 }, { id: 2 }]);
collection.sum('id'); // 3
collection.sum(obj => obj.id); // 3
```

#### min

The `min` method returns the lowest number from the collection while casting strings to numbers if possible otherwise throws an error. Optionally it takes a string for the property key or getter function receiving the item to return a single value.

```js
import { Collection } from '@upfrontjs/framework';

let collection = new Collection([1, 2]);

collection.min(); // 1

collection = new Collection(['3', '4']);
collection.min(); // 3

collection = new Collection([{ id: 1 }, { id: 2 }]);
collection.min('id'); // 1
collection.min(obj => obj.id); // 1
```

#### max

The `max` method returns the highest number from the collection while casting strings to numbers if possible otherwise throws an error. Optionally it takes a string for the property key or getter function receiving the item to return a single value.

```js
import { Collection } from '@upfrontjs/framework';

let collection = new Collection([1, 2]);

collection.max(); // 2

collection = new Collection(['3', '4']);
collection.max(); // 4

collection = new Collection([{ id: 1 }, { id: 2 }]);
collection.max('id'); // 2
collection.max(obj => obj.id); // 2
```

#### average

The `average` method returns the average of the number from the collection while casting strings to numbers if possible otherwise throws an error. Optionally it takes a string for the property key or getter function receiving the item to return a single value.

```js
import { Collection } from '@upfrontjs/framework';

let collection = new Collection([1, 2]);

collection.average(); // 1.5

collection = new Collection(['3', '4']);
collection.average(); // 3.5

collection = new Collection([{ id: 1 }, { id: 2 }]);
collection.average('id'); // 1.5
collection.average(obj => obj.id); // 1.5
```
