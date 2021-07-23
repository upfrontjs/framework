# Relationships

Upfront helps with parsing, handling and querying related data just like you would in your backend framework. To allow such easy access first you have to define your relations on the model.

## Define a relationship

The following relationships are available:
 - [belongsTo](#belongsto)
 - [belongsToMany](#belongstomany)
 - [hasMany](#hasmany)
 - [hasOne](#hasone)
 - [morphMany](#morphmany)
 - [morphOne](#morphone)
 - [morphTo](#morphto)

These relation methods are somewhat reflecting of how the backend data relations have been set up. It is reasonable to think that relations of any complexity can be handled by the above as upfront doesn't need to be aware of how a distant relation is related.
The methods return their target model with the endpoint set to the expected values.

To define a relationship you can call the appropriate relations on the model.
```js
import { Model } from '@upfrontjs/framework';
import Shift from '@Models/Shift';

export default class User extends Model {
    $shifts() {
        return this.belongsTo(Shift)
    }
}
```

Then you may query as:
```js
import User from '@Models/User';

const user = new User({ id: 1 });
const shiftsWithColleagues = user.$shifts().with('colleagues').get(); // ModelCollection

await user.load('contract');
user.contract; // Contract
```

Notice that relationship methods has to start with the defined [relationMethodPrefix](#relationmethodprefix). This will ensure that they can be distinguished from their accessor counterpart.

## Relation Types

#### belongsTo

The `belongsTo` method describes a 'belongs to' relationship in the database. It takes two arguments, the first being the related model's constructor, and the second optionally the foreign key's name.

```ts
// User.ts
import { Model } from '@upfrontjs/framework';
import Team from '@models/Team';

export default class User extends Model {
    public $team(): Team {
        return this.belongsTo(Team);
    }
}

// myScript.ts
import User from '@models/User'

const user = await User.limit(1).get();
const team = await user.$team().get();
```

#### belongsToMany

The `belongsToMany` method describes a 'belongs to many' relationship in the database. It takes two arguments, the first being the related model's constructor, and the second optionally the relation name that is used on the back end.

::: warning
 This functionality depends on the back end being capable [parsing nested where queries](../services/api.md#query-types).
:::

```ts
// User.ts
import { Model } from '@upfrontjs/framework';
import Role from '@models/Role';

export default class User extends Model {
    public $roles(): Role {
        return this.belongsToMany(Role);
    }
}

// myScript.ts
import User from '@models/User'

const user = await User.limit(1).with().get();
const userRoles = await user.$roles().get();
```

#### hasMany

The `hasMany` method describes a 'has many' relationship in the database. It takes two arguments, the first being the related model's constructor, and the second optionally the foreign key name on the related model.

```ts
// User.ts
import { Model } from '@upfrontjs/framework';
import Comment from '@models/Comment';

export default class User extends Model {
    public $comments(): Comment {
        return this.hasMany(Comment);
    }
}

// myScript.ts
import User from '@models/User'

const user = await User.limit(1).get();
const userComments = await user.$comments().get();
```

::: tip
[hasMany](#hasmany) and [hasOne](#hasone) methods also allows us to create related resources while automatically setting the related column value.

```ts
// User.ts
export default class User extends Model {
    public $grades(): Grade {
        return this.hasMany(Grade);
    }
}

// myScript.ts
import User from '@models/User'

const user = await User.limit(1).get();
const grade = user.$grade().userId; // 1

grade.save({ value: 'A+' }); // post body: { value: 'A+', user_id: 1 }
```
:::

#### hasOne

The `hasOne` method describes a 'has one' relationship in the database. It takes two arguments, the first being the related model's constructor, and the second optionally the foreign key name on the related model.

```ts
// User.ts
import { Model } from '@upfrontjs/framework';
import Car from '@models/Car';

export default class User extends Model {
    public $car(): Car {
        return this.hasMany(Car);
    }
}

// myScript.ts
import User from '@models/User'

const user = await User.limit(1).get();
const userCar = await user.$car().get();
```

#### morphMany

The `morphMany` method describes a relation to a polymorphic entity. The method takes two arguments, the first being the related model's constructor, and the second optionally the morph name used for associating to the current model.

```ts
// User.ts
import { Model } from '@upfrontjs/framework';
import File from '@models/File';

export default class User extends Model {
    public $documents(): File {
        return this.morphMany(File);
    }
}

// myScript.ts
import User from '@models/User'

const user = await User.limit(1).get();
const userDocuments = await user.$documents().get();
```

#### morphOne

The `morphOne` method describes a relation to a polymorphic entity. The method takes two arguments, the first being the related model's constructor, and the second optionally the morph name used for associating to the current model.

```ts
// User.ts
import { Model } from '@upfrontjs/framework';
import File from '@models/File';

export default class User extends Model {
    public $passport(): File {
        return this.morphOne(File);
    }
}

// myScript.ts
import User from '@models/User'

const user = await User.limit(1).get();
const userPassport = await user.$passport().get();
```

#### morphTo

The `morphTo` method describes a polymorphic relation where the model can describe to multiple entities.

```ts
// Rate.ts
import { Model } from '@upfrontjs/framework';
import Car from '@models/Car';

export default class Rate extends Model {
    public $rateables(): Car {
        return this.morphTo();
    }
}

// myScript.ts
import Rate from '@models/Rate'

const rating = await Rate.limit(1).get();
const ratingWithRatedEntities = await rating.$rateables().get();
```

## Manage Relations

#### addRelation
<Badge text="advanced" type="tip"/>
The `addRelations` method adds the relation onto the current model. It accepts two arguments, the first being the name with or without the [relationMethodPrefix](#relationmethodprefix), and the second the relation data in the format of an object, model class, array or collection.

```js
import User from '@Models/User';
import Contract from '@Models/Contract';

const user = new User({ id: 1 });
user.addRelation('shifts', { id: 1 });
user.shifts; // ModelCollection[Shift]

user.addRelation('$contract', new Contract({ id: 1, user_id: 1 }));
user.contract; // Contract
```

#### getRelation
<Badge text="advanced" type="tip"/>
The `getRelation` method returns the value of the given relation in a checked manner. This is mostly used internally and includes exceptions.

#### getRelations

The `getRelations` method returns a deep clone of all the relations currently on the model.

#### removeRelation

The `removeRelation` method removes the given relation from the model.

```js
import User from '@Models/User';

const user = new User({ contract: { id: 1 } });
user.relationLoaded('contract'); // true
user.removeRelation('contract').relationLoaded('$contract'); // false
```

#### relationLoaded

The `relationLoaded` method determines whether the given relation has been loaded or not.

```js
import User from '@Models/User';

const user = new User({ contract: { id: 1 } });
user.relationLoaded('contract'); // true
user.relationLoaded('$shifts'); // false
```

#### loadedRelationKeys

The `loadedRelationKeys` return an array of the relations keys that are currently available on the model.

## Auxiliary methods

#### relationMethodPrefix

The `relationMethodPrefix` is a getter on the model that is used to identify relationship calls. All [relationship definitions](#define-a-relationship) have to start with the set value. The default value is `'$'`.

```js
import { Model } from '@upfrontjs/framework';
import Shift from '@Models/Shift';

export default class User extends Model {
    get relationMethodPrefix() {
        return '$';
    }
}
```

#### for

The `for` method is used for [setting](./api-calls.md#setendpoint) custom endpoints for the next request using the given set of models. It is generally used in custom use cases where the api is not designed to return the desired data in the expected endpoint.

```js
import User from '@Models/User';

user.for(new Team({ id: 1 })); // 'teams/1/users'
user.for([new Team({ id: 1 }), new Contract({ id: 1 })]); // 'teams/1/contracts/1/users'
user.for([new Team, new Contract({ id: 1 })]); // 'teams/contracts/1/users'
```

### Overwrites

These methods are used internally to do some work for your. If they are not guessing the values correctly, you may overwrite them in your model class.

#### getMorphs

The `getMorphs` method is utilised by the [morphOne](#morphone) and [morphMany](#morphmany) methods. It is used to figure out the foreign key and foreign entity name columns on the morph relations.

 - `Tag` -> `'taggable_type'`, `'taggable_id'`
 - `Like` -> `'likeable_type'`, `'likeable_id'`
 - etc...

#### guessForeignKeyName

The `guessForeignKeyName` is used to figure out the column name used on other tables for the current model.
 - `User` -> `'user_id'` (The model's [getKeyName](./readme.md#getkeyname) returns `'id'`)
 - `Contract` -> `'contract_uuid'` (The model's [getKeyName](./readme.md#getkeyname) returns `'uuid'`)
