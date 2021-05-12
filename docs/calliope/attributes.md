# Attributes

Models have been given powerful tools to manage data without involved logic and decision trees. There are 4 main parts to be considered when using a model:

 - [Casting](#casting)
 - [Guarding](#guarding)
 - [Mutators/Accessors](#mutatorsaccessors)
 - [Attribute management](#attribute-management)
 - [Tracking changes](#tracking-changes)

## Casting

Casting transforms values when accessing or setting attributes on a model.
To define the casters on your model you should define a getter for the `casts` property.

<code-group>
<code-block title="Javascript">
```js
// User.js
import { Model } from '@upfrontjs/framework';

export default class User extends Model {
    get casts() {
        return {
            isAdmin: 'boolean'
        }
    }
}
```
</code-block>

<code-block title="Typescript">
```ts
// User.ts
import { Model } from '@upfrontjs/framework';
import type { CastType } from '@upfrontjs/framework';

export default class User extends Model {
    // you can set the return value or
    get casts(): Record<string, CastType> {
        return {
            isAdmin: 'boolean' // set this to `as const` to change string type to 'boolean' type
        }
    }
}
```
</code-block>
</code-group>

**The following cast types are available:**

::: warning
If the values cannot be casted, an error will be thrown.
:::
#### `'boolean'`
Casts the values to boolean. It does not evaluate values as truthy or falsy, it expects the numeric `0, 1`, booleans or `'true', 'false'` in any casing. This is useful to parse the data from the back-end.

#### `'string'`
Casts the values to a string. This casts all values, meaning `undefined` will become `'undefined'` and objects will have their `toString` method called.

#### `'number'`
Casts the values to a number.

#### `'collection'`
Casts the values to a [Collection](../helpers/collection.md) by calling the collection constructor.

#### `'datetime'`

Cast the values to the [given date time](../helpers/global-config.md#datetime) by calling the method or its constructor.

#### custom object

This is an object which implements the `AttributeCaster` type. Meaning it has a `get` and a `set` method both of which accepts a value, and an `Attributes` object (the equivalent of [getRawAttributes](#getrawattributes)) argument.

<code-group>
<code-block title="Javascript">
```js
// User.js
import { Model } from '@upfrontjs/framework';

export default class User extends Model {
    get casts() {
        return {
            myAttribute: {
                get (value, attributes) {
                    return String(value) + '1';
                },
                set (value, attributes) {
                    return String(value) + '2';
                }
            }
        }
    }
}
```
</code-block>

<code-block title="Typescript">
```ts
// User.ts
import { Model } from '@upfrontjs/framework';
import type { AttribteCaster } from '@upfrontjs/framework';

const myAttribute: AttributeCaster = {
    get (value, attributes) {
        return String(value) + '1';
    },
    set (value, attributes) {
        return String(value) + '2';
    }
}

export default class User extends Model {
    get casts() {
        return { myAttribute }
    }
}
```
</code-block>
</code-group>

### Further casting methods

#### setCasts

The `setCasts` method sets the casts for the model, replacing the existing configuration.

```js
import User from '@upfrontjs/framework';

const user = new User;

user.hasCast('test'); // false
user.setCasts({ test: 'boolean' }).hasCast('test'); // true
```

#### hasCast

The `hasCast` method determines whether the given key has a cast defined.
```js
import User from '@upfrontjs/framework';

const user = new User;

user.hasCast('test'); // false
user.setCasts({ test: 'boolean' }).hasCast('test'); // true
```
#### mergeCasts

The `mergeCasts` method merges the given casts with the existing casting configuration.

```js
import User from '@upfrontjs/framework';

const user = new User;

user.setCasts({ test: 'boolean' })
    .mergeCasts({ test1: 'number' })
    .hasCast('test'); // true
user.hasCast('test1'); // true
```

## Guarding

With models there are option to mass assign attributes to the model though the constructor or the [fill](#fill) method. However, when you're constructing your attributes dynamically, you may come across scenarios where you may not want every attribute assigned to the model on mass assignment. For these, there is an option to white and black list attribute keys.

To define these rules, you create a `fillable` and/or `guarded` getter function which returns an array of strings.
```js
// User.js
export default class User extends Model {
    get fillable() {
        return ['id', 'name'];
    }

    get guarded() {
        return ['*'];
    }
}
```

This in action will look like:
```js
import User from '@Models/User';

const user = new User({ someAttribute: 1, name: 'name' });
user.getAttributes(); // { name: 'name' }
```

There is an option where these return values include `'*'`. In this case all attributes will respect the guarding defined.

The default settings are guarded: `['*']` and fillable: `[]`.

::: warning
If key is defined in both guarded and fillable, then fillable takes priority when evaluating whether an attribute is guarded or not.
:::

**To manage the fillable settings there are a couple utility methods available:**

#### getFillable

The `getFillable` method returns the currently fillable attributes.

```js
import User from '@Models/User';

const user = new User;
user.getFillable(); // ['id', 'name']
```

#### getGuarded

The `getFillable` method returns the currently guarded attributes.

```js
import User from '@Models/User';

const user = new User;
user.getGuarded(); // ['*']
```

#### mergeFillable

The `mergeFillable` method merges in the given attributes to the existing configuration.

```js
import User from '@Models/User';

const user = new User;
user.mergeFillable(['dob']).getFillable(); // ['id', 'name', 'dob']
```

#### mergeGuarded

The `mergeGuarded` method merges in the given attributes to the existing configuration.

```js
import User from '@Models/User';

const user = new User;
user.mergeGuarded(['dob']).getGuarded(); // ['*', 'dob']
```

#### setFillable

The `setFillable` method replaces the existing fillable configuration.

```js
import User from '@Models/User';

const user = new User;
user.setFillable(['dob']).getFillable(); // ['dob']
```

#### setGuarded

The `setGuarded` method replaces the existing guarded configuration.

```js
import User from '@Models/User';

const user = new User;
user.setGuarded(['dob']).getGuarded(); // ['dob']
```

#### isFillable

The `isFillable` method determines whether the given attribute key is fillable or not.

```js
import User from '@Models/User';

const user = new User;
user.isFillable('dob'); // false
user.setFillable(['dob']).isFillable('dob'); // false
```

#### isGuarded

The `isGuarded` method determines whether the given attribute key is guarded or not.

```js
import User from '@Models/User';

const user = new User;
user.isGuarded('dob'); // false
user.setGuarded(['dob']).isGuarded('dob'); // false
```

## Mutators/Accessors

Besides [casts](#casting) there is also an alternative method to transform your values on the fly. You can define accessors which are called when you're accessing an attribute and mutators which are called when you're setting a value. You can define them like the following example

```js
User.js
import { Model } from '@upfrontjs/framework';

export default class User extends Model {
    getFullNameAttribute(name) {
        return this.title + ' ' + name;
    }

    setFullNameAttribute(name) {
        return name.startsWith(this.title + ' ')
            ? name.slice(this.title.length + 1)
            : name;
    }
}
```

::: warning
The methods always have to follow the following format:

`set/get` + your attribute name in PascalCase + `Attribute()`
:::

After you have defined your accessors and mutators they'll be automatically called when accessing the attribute on the model and has been previously mass assigned or has been set with the [setAttribute](#setattribute) method.

```js
import User from '@Models/User';

const user = new User({ title: 'Dr.', fullName: 'John Doe' });
user.fullName; // 'Dr. John Doe'
```

## Attribute management

Models can be constructed with the `new` keyword. This will mass assign attributes to the model while respecting the [guarding](#guarding) settings.

::: warning
When constructing an instance and only passing in another instance of the model:
```js
import User from '@Models/User';
import Shift from '@Models/Shift';

const user = new User({ name: 'John Doe' });
const newUser = new User(user);
```
It will clone the [raw attributes](#getrawattributes) and the [relationships](./relationships.md) of the model.
:::

#### attributeCasing

While some prefer to name their variables and object keys as [camelCase](../helpers/readme.md#camel) others will prefer [snake_case](../helpers/readme.md#snake) or perhaps there are different conventions between the front and back end. To accommodate such preferences you can set the `attributeCasing` getter to return either `'camel'` or `'snake'` like so:

<code-group>
<code-block title="Javascript">
```js
// User.js
import { Model } from '@upfrontjs/framework';

export default class User extends Model {
    get attributeCasing() {
        return 'snake';
    }
}
```
</code-block>

<code-block title="Typescript">
```ts
// User.ts
import { Model } from '@upfrontjs/framework';

export default class User extends Model {
    public get attributeCasing() {
        return 'snake' as const;
    }
}
```
</code-block>
</code-group>

When using mass-assignment like the [constructor](#attribute-management) and the [fill](#fill) methods, all keys will automatically transform to its respective casing. `user.fill({ some_value: 1 }).someValue; // 1`
The default value is `'camel'`. This can be counteracted by the [serverAttributeCasing](./api-calls.md#serverattributecasing) getter method when sending data to the server.

---

**To aid with managing data on the model, numerous methods are available to use:**

#### for...of

Just like object literals, models are also iterable using a for of loop. This loop will iterate over the attributes, then the [relations](./relationships.md).

```js
import User from '@Models/User';
import Shift from '@Models/Shift';

const user = new User({ title: 'Dr.', shifts: [new Shift] });

for (const [item, key] of user) {
    // ...
}
```

#### setAttribute

The `setAttribute` method is what's used for setting attributes on the model. Its role is to delegate the value transformation, set the value in the right context and create access to the value. When an attribute has been set on the model, you'll be able to access the values like so:
```js
import User from '@Models/User';

const user = new User;
user.setAttribute('name', 'John Doe');
user.name; // 'John Doe'
user.name = 'Jane Doe';
user.name; // 'Jane Doe'
```

`setAttribute` is used internally when using mass-assignment with the [fill](#fill) or [constructor](#attribute-management) methods, meaning the same behaviour will apply. Furthermore, it can also handle the [relationship](./relationships.md) values just like the [addRelation](./relationships.md#addrelation) method would.

When setting an attribute following priority will apply to value:
 - If exists use the [mutator](#mutatorsaccessors) to set the attribute.
 - If [cast](#casting) defined, use the casted value to set the attribute.
 - If the `key` argument is a defined relation and the `value` argument is a valid relation value, set the relation value.
 - Otherwise, just set the attribute on the model.

#### getAttribute

The `getAttribute` method is what's used for getting attributes from the model. Its role is to delegate the value transformation and get the attribute from different sources. When an attribute has been set on the model, you'll be able to access the values like so:
```js
import User from '@Models/User';

const user = new User({ name: 'John Doe' });
user.name; // 'John Doe'
user.getAttribute('name'); // 'John Doe'
```

Optionally the method takes a second argument which is returned if the key cannot be resolved.
This method is internally used when accessing attributes on the model like in the above example. The model will resolve the value in the following order:

 - If the attribute exists and has an [accessor](#mutatorsaccessors), return the accessor's value.
 - If the attribute exists, and a cast has been defined, return the casted value.
 - If the given key is a relation's name, and the relation [has been loaded](./relationships.md#relationloaded), return the relation.
 - If the key is a property of the model, and it's a function, return the default value.
 - If the key is a property of the model, return its value.
 - Otherwise, return the default value.

#### getAttributes

The `getAttributes` method returns all the attributes that has been set in an object format. It resolves the values in the same methodology as the [getAttribute](#getattribute) method except it only returns attributes.

```js
import User from '@Models/User';

const user = new User({ firstName: 'John', lastName: 'Doe' });
user.getAttributes(); // { firstName: 'John', lastName: 'Doe' }
```

#### getRawAttributes

The `getRawAttributes` method returns all the attributes similarly to [getAttributes](#getattributes) except is does not use the any value transformation.

#### getAttributeKeys

The `getAttributeKeys` method returns all the attribute keys on the model currently set.

```js
import User from '@Models/User';

const user = new User({ firstName: 'John', lastName: 'Doe' });
user.getAttributeKeys(); // ['firstName', 'lastName']
```

#### deleteAttribute

The `deleteAttribute` method removes the attribute with the given key from the attributes. Further more if the key also represents a relation, remove the relation. Otherwise, if it is a property of the model and isn't a function remove the property.

```js
// User.js
import { Model } from '@upfrontjs/framework';

export default class User extends Model {
    myFunc() {
        return;
    }
}

// myScript.js
import User from '@Models/User';
import Shift from '@Models/Shift';

const user = new User({ firstName: 'John', lastName: 'Doe' });
user.property = 1;
user.addRelation('shifts', [new Shift]);

user.deleteAttribute('firstName').firstName; // undefined
user.deleteAttribute('property').property; // undefined
user.deleteAttribute('shifts').shifts; // undefined
user.deleteAttribute('myFunc').myFunc; // [Function: myFunc]
```

#### fill

The `fill` method merges in the given attributes onto the model that are considered [fillable](#guarding). Under the hood it uses the [setAttribute](#setattribute) method, meaning the same logic applies.

```js
import User from '@Models/User';

const user = new User({ firstName: 'John', lastName: 'Doe' });
user.fill({ fistName: 'Jane', title: 'Dr.' }).getAttributes(); // { firstName: 'Jane', lastName: 'Doe', title: 'Dr. }
```

#### forceFill

The `forceFill` method merges in the given attributes regardless of [guarding](#guarding). Under the hood it uses the [setAttribute](#setattribute) method, meaning the same logic applies.

#### only

The `only` method returns only the attributes that match the given key(s).

```js
import User from '@Models/User';

const user = new User({ firstName: 'John', lastName: 'Doe' });
user.only('fistName'); // { firstName: 'John' }
```
#### except

The `except` method returns only the attributes that match does not the given key(s).

```js
import User from '@Models/User';

const user = new User({ firstName: 'John', lastName: 'Doe', title: 'Dr.' });
user.except(['fistName', 'title']); // { lastName: 'Doe' }
```

#### toJson

The `toJson` method returns the json string representation of the model's attributes and relations.

```js
import User from '@Models/User';

const user = new User({ name: 'John Doe' });
user.addRelation('shifts', new Shift({ shiftAttr: 1 })).toJson(); // {"name":"John Doe","shifts":[{"shiftAttr":1}]}
```

## Tracking changes

To determine and manage the data's state on the model, and to examine the difference between the original data, and the data the model has been constructed with, a couple of helper methods have been added to that end.

#### syncOriginal

The `syncOriginal` method set's the original state of the data to the current state of it.
```js
import User from '@Models/User';

const user = new User({ name: 'John Doe' });
user.name = 'Jane Doe';
user.getOriginal('name'); // 'John Doe'
user.syncOriginal().getOriginal('name'); // 'Jane Doe'
```

#### reset

The `reset` method will set the attributes to the original values, discarding any changes.

```js
import User from '@Models/User';

const user = new User({ name: 'John Doe' });
user.name = 'new name';
user.getChanges(); // { name: 'new name' }
user.reset().getChanges(); // {}
```

#### getOriginal

The `getOriginal` method returns the original value in a resolved format. Meaning it will use the [accessor](#mutatorsaccessors) if defined or it will [cast](#casting) the value if cast defined. The method optionally takes a second argument which the method will default to if the key is not found.
```js
import User from '@Models/User';

const user = new User({ name: 'John Doe' });
user.name = 'Jane Doe';
user.getOriginal('name'); // 'John Doe'
user.getOriginal('title', 'Mr.'); // 'Mr.'
```

#### getRawOriginal

The `getRawOriginal` method works the same as the [getOriginal](#getoriginal) method, except it will not transform the values.

#### getChanges

The `getChanges` method returns only the changed data since the model was constructed based on deep equality. Optionally it takes a key, in which case only the changes for the given key is returned. If there are no changes, an empty object is returned.
```js
import User from '@Models/User';

const user = new User({ name: 'John Doe', title: 'Mr.' });
user.getChanges(); // {}
user.name = 'Jane Doe';
user.getChanges(); // { name: 'Jane Doe' }
user.getChanges('name'); // { name: 'Jane Doe' }
user.getChanges('title'); // {}
```

#### getDeletedAttributes

The `getDeletedAttributes` method returns only the deleted attributes since the last [sync](#syncoriginal) with the original attributes. Optionally it takes a key in which case, only the key will be included in the return value if it has been deleted.

```js
import User from '@Models/User';

const user = new User({ name: 'John Doe', title: 'Mr.' });
user.getDeletedAttributes(); // {}
user.deleteAttribute('name').getDeletedAttributes(); // { name: 'John Doe' }
user.deleteAttribute('title').getDeletedAttributes('name'); // { name: 'John Doe' }
```

#### getNewAttributes

The `getNewAttributes` method returns only the newly added attributes since the last [sync](#syncoriginal) with the original attributes. Optionally it takes a key in which case, only the key will be included in the return value if it has been recently added.

```js
import User from '@Models/User';

const user = new User({ name: 'John Doe', title: 'Mr.' });
user.getNewAttributes(); // {}
user.setAttribute('attr', 1).getNewAttributes(); // { attr: 1 }
user.setAttribute('attr2', 2).getNewAttributes('attr'); // { attr: 1 }
```

#### hasChanges

The `hasChanges` method determines whether any changes have occurred since constructing the model. Optionally it can take a key argument which only inspect the attribute's state which matches the given key. It takes [new](#getnewattributes) and [deleted](#getdeletedattributes) attributes into consideration.
```js
import User from '@Models/User';

const user = new User({ name: 'John Doe', title: 'Mr.' });
user.hasChanges(); // false
user.name = 'Jane Doe';
user.hasChanges(); // true
user.hasChanges('name'); // true
user.hasChanges('title'); // false
user.deleteAttribute('title').hasChanges('title'); // true
user.setAttribute('attr', 1).hasChanges('attr'); // true
```


#### isDirty

The `isDirty` method is an alias of the [hasChanges](#haschanges) method.

#### isClean

The `isClean` method determines whether the attributes matches with the original attributes since the model constructing. Optionally it can take a key argument in which case it only inspect the given attribute's state.
```js
import User from '@Models/User';

const user = new User({ name: 'John Doe', title: 'Mr.' });
user.isClean(); // true
user.name = 'Jane Doe';
user.isClean(); // false
user.isClean('name'); // false
user.isClean('title'); // true
```
