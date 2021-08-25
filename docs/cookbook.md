# Cookbook

## What is the cookbook for?

In the documentation simple and concise examples are favoured to avoid too much information. But to build on that knowledge, this section allows for exploring patterns/code snippets/complex examples in-depth.

## Recipes

### Table of content

- [Extend collections](#extend-the-collections-to-fit-your-needs)
- [Scope building](#scope-building)
- [Sending requests without models](#sending-requests-without-models)
- [Alias methods](#alias-methods)

#### Extend the collections to fit your needs.
Don't be afraid of changing and overriding methods if that solves your problem. The aim is to make development a breeze.

<code-group>

<code-block title="Javascript">
```js
// UserCollection.js
import User from '@models/User';
import { ModelCollection } from '@upfrontjs/framework';

export default class UserCollection extends ModelCollection {
    areAwake() {
        return this.filter(user => user.wokeUp && user.hadBeverage('hot'));
    }
    
    async markAsReady() {
        return User.whereKey(this.modelKeys()).update({ ready: true });
    }
}

// my-file.js
import User from '@models/User';
import UserCollection from '@/UserCollection';

const modelCollection = await User.latest().limit(10).get();
let users = new UserCollection(modelCollection.toArray());

if (users.areAwake().length === modelCollection.length) {
    await users.markAsReady();
} else {
    console.log('Oh no, somebody\'s not ready yet!');
}
```
</code-block>

<code-block title="Typescript">
```ts
// UserCollection.ts
import User from '@models/User';
import { ModelCollection } from '@upfrontjs/framework';

export default class UserCollection<T extends User> extends ModelCollection<T> {
    areAwake(): ModelCollection<T> {
        return this.filter(user => user.wokeUp && user.hadBeverage('hot'));
    }

    async markAsReady(): ModelCollection<User> {
        return User.whereKey(this.modelKeys()).update({ ready: true });
    }
}

// my-file.ts
import User from '@models/User';
import UserCollection from '@/UserCollection';

const modelCollection = await User.latest().limit(10).get();
let users = new UserCollection(modelCollection.toArray());

if (users.areAwake().length === modelCollection.length) {
    await users.markAsReady();
} else {
    console.log('Oh no, somebody\'s not ready yet!');
}
```
</code-block>

</code-group>

---

#### Scope building
When you see a pattern which you include in your queries often you might consider adding a "scope" method to your class.

```js
// User.js
import { Model } from '@upfrontjs/framework';

export default class User extends Model {
    experiencedDriver() {
        return this.has('vehicle')
            .where('licensed', true)
            .where('license_acquired_at', '>=', dateTimeLib().subYears(10).toISOString())
            .scope('canDriveAnything');
    }
}

// my-file.js
import User from '@models/User';

const experiencedDrivers = await User.newQuery().experiencedDriver().get();
const experiencedSafeDrivers = await User
    .has('advancedCertification')
    .experiencedDriver()
    .get();
```

#### Sending requests without models

With the default [ApiCaller](./services#apicaller) and [HandlesApiRequest](./services#handlesapiresponse) implementations, you can interact with your api without the need for the models or any of their methods.

```js
import { GlobalConfig } from '@upfrontjs/framework';

const config = new GlobalConfig;
const handler = config.get('apiResponseHandler');
const api = config.get('api');

const form = new FormData;
// ... collect the form entries

const response = await handler.handle(
    api.call(
        config.get('baseEndPoint').finish('/') + 'form',
        'post',
        form,
        { 'X-Requested-With': 'Upfront' },
        { query: { parameters: 'to encode' } }
    )
);
```

#### Alias methods

There may be some logic you frequently use, but it might not be apparent at the first glance what's happening or can be simpler to comprehend.

For example, you may express that you want the first model like so:

```js
import User from '@models/User';

const firstUser = (await User.limit(1).get()).first();
```

This can be simplified like:
```js
// User.js
import { Model } from '@upfrontjs/framework';

export default class User extends Model {
    async first() {
        const users = await User.limit(1).get(); // ModelCollection[User]
        
        return users.first();
    }
}

// my-file.js
import User from '@models/User';

const firstUser = await User.newQuery().first();
// then you may also use it in normal query building
const myFirstUser = await User.where('name', 'like', '%me%').first()
```
