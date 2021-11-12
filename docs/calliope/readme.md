# Model

The model is at the hearth of this package. It boasts a lot of features, so they have been broken down into the following sections:
 - [Attributes](./attributes.md)
 - [Api calls](./api-calls.md)
 - [Query Building](./query-building.md)
 - [Relationships](./relationships.md)
 - [Timestamps](./timestamps.md)
 - [Additional Methods](#additional-methods)

## Creating Models

To create a model, you should first define your model class:
```js
// User.js
import { Model } from '@upfrontjs/framework';

export default class User extends Model {}
```

Then you can call your model in various way, for example
```js
// myScript.js
import User from '@Models/User';

User.find(1);
// or 
new User({ my: attributes });
// etc...
```

## Getters

#### primaryKey

The `primaryKey` is a getter of the column name which is used to identify your model. The default value is `'id'`.

```js
// User.js
import { Model } from '@upfrontjs/framework';

export default class User extends Model {
    get primaryKey() {
        return 'id';
    }
}
```

#### exists

The `exists` property is a getter on the model that returns a boolean which can be used to assert that the model has been persisted. It takes the [primary key](#getkey), [timestamps](./timestamps.md#timestamps) and [soft deletes](./timestamps.md#soft-deletes) into account.

## Additional methods

#### is

The `is` method compares the given model with the current model based on the [getKey](#getkey) and [getName](#getname)

```js
import User from '@Models/User';
import Shift from '@Models/Shift';

const user = new User({ id: 1 });
const user2 = new User({ id: 2 });
const shift = new Shift({ id: 1 });

user.is(user); // true
user.is(user2); // false
user.is(shift); // false
```

#### isNot

The `isNot` method is the inverse of the [is](#is) method.

#### getKey

The `getKey` method returns the value of the primary key from the model.

#### getKeyName

The `getKeyName` method returns the [primaryKey](#primarykey) of the model.

#### getName

The `getName` method returns the current class' name. For example a class called `User` will return `'User'`.

#### replicate

The `replicate` method copies the instance into a non-existent instance. Meaning primary key and the timestamps won't be copied.

```js
import User from '@Models/User';

const user = User.factory().create();
user.getKey(); // 1
user.name; // 'the name'
user.getAttribute(user.getCreatedAtColumn()); // Date instance

const userCopy = user.replicate();
userCopy.getKey(); // undefined
userCopy.name; // 'the name'
userCopy.getAttribute(userCopy.getCreatedAtColumn()); // undefined
```

#### factory
<Badge text="static" type="warning"/>

The `factory` is a method that returns a [Factory](../testing.md#factorybuilder) instance. Optionally it takes a number argument which is a shorthand for the [times](../testing.md#times) method.

```js
import User from '@Models/User';

const user = User.factory().create(); // User
const users = User.factory(2).create(); // ModelCollection
```

#### all
<Badge text="static" type="warning"/><Badge text="async" type="warning"/>

The `all` method will initiate a request that returns a [ModelCollection](./model-collection.md) from the underlying [get](./api-calls.md#get) method.

```js
import User from '@Models/User';

const users = await User.all();
users; // ModelCollection[User, ...]
```

#### save
<Badge text="async" type="warning"/>

The `save` method will update or save your model based on whether the model [exists](#exists) or not. If the model exists it will send a `PATCH` request containing the changes, and the optionally passed in attributes. If the model does not exists it will send a `POST` request. The method returns the same current user updated with the response data if any.

#### update
<Badge text="async" type="warning"/>

The `update` method sets the correct endpoint then initiates a [patch](./api-calls.md#patch) request. If the model does not [exists](#exists) it will throw an error.

```js
import User from '@Models/User';

const user = User.factory.make();
user.update({ optionalExtra: 'data' });
```

#### find
<Badge text="async" type="warning"/>

The `find` method sends a `GET` request to the model [endpoint](./api-calls.md#getendpoint) supplemented with the given id. Available both static and non-statically.

```js
import User from '@Models/User';

const user = User.find('8934d792-4e4d-42a1-bb4b-45b34b1140b4');
```

#### findMany
<Badge text="async" type="warning"/>

The `findMany` method similar to the [find](#find) method sends a `GET` request to the model [endpoint](./api-calls.md#getendpoint) but adds a [whereKey](./query-building.md#wherekey) constraint to the request, returning a [ModelCollection](./model-collection.md). Available both static and non-statically.

```js
import User from '@Models/User';

const users = User.findMany([1, 2]);
users; // ModelCollection[User, User]
```

#### refresh
<Badge text="async" type="warning"/>

The `refresh` method updates all the attributes on the model by [selecting](./query-building.md#select) the present [attribute keys](./attributes.md#getattributekeys) and setting the attributes from the response. This will reset any attribute [changes](./attributes.md#getchanges).

```js
import User from '@Models/User';

const user = await User.find(1);
user.name = 'new name';
user.getChanges(); // { name: 'new name' }
await user.refresh();
user.getChanges(); // {}
```
