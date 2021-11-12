# Cookbook

## What is the cookbook for?

In the documentation simple and concise examples are favoured to avoid too much information. But to build on that knowledge, this section allows for exploring patterns/code snippets/complex examples in-depth.

## Recipes

### Table of content

- [Extend collections](#extend-the-collections-to-fit-your-needs)
- [Scope building](#scope-building)
- [Sending requests without models](#sending-requests-without-models)
- [Alias methods](#alias-methods)
- [Extend query builder functionality](#extend-query-builder-functionality)

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
import { GlobalConfig, API, ApiResponseHandler } from '@upfrontjs/framework';

const config = new GlobalConfig;
const handler = new ApiResponseHandler;
const api = new API;

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

There may be some logic you frequently use, but it might not be apparent at the first glance what's happening or can be made simpler to comprehend.

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

#### Extend query builder functionality

Extending/overwriting the model should not be a daunting task. If we wanted we could add an extra method to send data to the server. In this example we add a new field on the sent data which is called `appends` and we're expecting the server to append additional information on the model response data.

```ts
import type { FormatsQueryParameters, QueryParams } from '@upfrontjs/framework';
import { Model as BaseModel } from '@upfrontjs/framework';

export default class ModelWithAppends extends BaseModel implements FormatsQueryParameters {
    protected appends: string[] = [];

    public append(name: string): this {
        this.appends.push(name);
        return this;
    }

    public withoutAppend(name: string): this {
        this.appends = this.appends.filter(appended => appended !== name);
        return this;
    }

    public formatQueryParameters(parameters: QueryParams & Record<string, any>): Record<string, any> {
        if (this.appends.length) {
            parameters.appends = this.appends;
        }

        return parameters;
    }

    public resetQueryParameters(): this {
        this.appends = [];
        return super.resetQueryParameters();
    }
}
```

Now if our other models extend our own model they will have the option to set the `appends` field on the outgoing requests.
