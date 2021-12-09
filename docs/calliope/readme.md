# Model

The model is at the hearth of this package. It boasts a lot of features, so they have been broken down into the following sections:
- [Attributes](./attributes.md)
- [Api calls](./api-calls.md)
- [Query Building](./query-building.md)
- [Relationships](./relationships.md)
- [Timestamps](./timestamps.md)
- [Additional Methods](#additional-methods)

## Creating Models

To create a model, you should first define your model class and define the [getName](#getname) method:

<code-group>

<code-block title="Javascript">

```js
// User.js
import { Model } from '@upfrontjs/framework';

export default class User extends Model {
    getName() {
        return 'User';
    }
}
```
</code-block>

<code-block title="Typescript">

```ts
// User.ts
import { Model } from '@upfrontjs/framework';

export default class User extends Model {
    public override getName(): string {
        return 'User';
    }
}
```
</code-block>

</code-group>

Then you can call your model in various way, for example
```js
// myScript.js
import User from '@Models/User';

User.find(1);
// or 
new User({ my: attributes });
// etc...
```

::: tip TIP (Typescript)
Typescript users may benefit from better typing support if they defined keys and their types on the models
```ts
export default class User extends Model {
    public is_admin?: boolean;
    public age?: number;
    public name?: string;
}
```
This will typehint keys on the model when accessing the above keys like `user.age` and will get type hinted in various methods such as [getAttribute](./attributes.md#getattribute) where both the key, the default value and the return value will be type hinted.
:::

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

The `getName` method expected to return the current class' name. For example in a class called `User` it should return `'User'`.

***Note: This is essential to add to every model as this is used throughout the framework.***
::: danger
This value cannot be `this.constructor.name` **if** you're minifying your code or in the minification options you haven't turned off the class rename or equivalent option.
:::

::: tip
If you turn of the class renaming when the code gets mangled by the minifier or bundler of your choice, `this.constructor.name` would be an acceptable solution. This would allow you to have a base model you can extend from which can in turn implement the `getName` that returns `this.constructor.name`.

Bundlers/minifier options examples:
- [terser: keep_classnames](https://terser.org/docs/api-reference#minify-options)
- [esbuild: keep-names](https://esbuild.github.io/api/#keep-names)
- [babel-minify: keepClassName](https://babeljs.io/docs/en/babel-minify#node-api)
  :::

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

#### clone

The `clone` method clones the instance in its current state. Meaning all changes to the [query building](./query-building.md), [endpoint](./api-calls.md#endpoint-manipulation) and [attribute changes](./attributes.md#tracking-changes) will be copied along. The result will match the original model but nothing is copied by reference.

```js
import User from '@Models/User';

const user = User.factory().create({ myKey: 1 });
const userClone = user.clone();
user.is(userClone); // true

user.myKey = 2;
userClone.myKey === 1; // true

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

const users = await User.all(); // ModelCollection[User, ...]
```

#### save
<Badge text="async" type="warning"/>

The `save` method will update or save your model based on whether the model [exists](#exists) or not. If the model exists it will send a `PATCH` request containing the changes, and the optionally passed in attributes. If the model does not exists it will send a `POST` request. The method returns the same current user updated with the response data if any.

#### update
<Badge text="async" type="warning"/>

The `update` method sets the correct endpoint then initiates a [patch](./api-calls.md#patch) request. If the model does not [exists](#exists) it will throw an error.

```js
import User from '@Models/User';

const user = User.factory.createOne();
await user.update({ optionalExtra: 'data' });
```

#### find
<Badge text="async" type="warning"/>

The `find` method sends a `GET` request to the model [endpoint](./api-calls.md#getendpoint) supplemented with the given id. Available both static and non-statically.

```js
import User from '@Models/User';

const user = await User.find('8934d792-4e4d-42a1-bb4b-45b34b1140b4');
```

#### findMany
<Badge text="async" type="warning"/>

The `findMany` method similar to the [find](#find) method sends a `GET` request to the model [endpoint](./api-calls.md#getendpoint) but adds a [whereKey](./query-building.md#wherekey) constraint to the request, returning a [ModelCollection](./model-collection.md). Available both static and non-statically.

```js
import User from '@Models/User';

const users = await User.findMany([1, 2]); // ModelCollection[User, User]
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
