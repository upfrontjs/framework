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
- [Send paginated requests](#send-paginated-requests)

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
        const users = await this.limit(1).get(); // ModelCollection[User]
        
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

export default class Model extends BaseModel implements FormatsQueryParameters {
    protected appends: string[] = [];

    public append(name: string): this {
        this.appends.push(name);
        return this;
    }

    // @ts-expect-error - despite TS2526, it still infers correctly
    public static append<T extends Model = InstanceType<this>>(name: string): T {
        this.newQuery<T>().append(name);
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

#### Send paginated requests

While it's nice to be able to [paginate locally](./helpers/pagination.md) it might not be desired to get too much data upfront. In this case a pagination can be implemented that will only get the pages in question on an explicit request. Of course, you might change the typings and the implementation to fit your needs.

```ts
// paginator.ts
import type { Attributes, Model } from '@upfrontjs/framework';
import { ModelCollection } from '@upfrontjs/framework';

interface PaginatedApiResponse<T = Attributes> {
    data: T[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        /**
         * From all the existing records this is where the current items start from.
         */
        from: number;
        /**
         * From all the existing records this is where the current items go to.
         */
        to: number;
        last_page: number;
        /**
         * String representation of a number.
         */
        per_page: string;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        /**
         * Total number of records.
         */
        total: number;
        path: string;
    };
}

export interface PaginatedModels<T extends Model> {
    data: ModelCollection<T>;
    next: () => Promise<PaginatedModels<T> | undefined>;
    previous: () => Promise<PaginatedModels<T> | undefined>;
    page: (page: number) => Promise<PaginatedModels<T> | undefined>;
    hasNext: boolean;
    hasPrevious: boolean;
    from: PaginatedApiResponse['meta']['from'];
    to: PaginatedApiResponse['meta']['to'];
    total: PaginatedApiResponse['meta']['total'];
}

async function paginator<T extends Model>(builder: T, page = 1, limit = 25): Promise<PaginatedModels<T>> {
    const response = (await builder.clone().limit(limit).page(page).call<PaginatedApiResponse<Attributes<T>>>('get'))!;
    const modelCollection = new ModelCollection<T>(response.data.map(attributes => {
        return builder
            .new(attributes)
            // @ts-expect-error - Protected internal method required for correct .exists detection
            .setLastSyncedAt();
    }));

    return {
        data: modelCollection,
        next: async () => {
            if (!response.links.next) return;
            return paginatedModels(builder, page + 1, limit);
        },
        previous: async () => {
            if (!response.links.prev) return;
            return paginatedModels(builder, page - 1, limit);
        },
        page: async (pageNumber: number) => {
            if (pageNumber > response.meta.last_page || pageNumber < 0) return;
            return paginatedModels(builder, pageNumber, limit);
        },
        from: response.meta.from,
        to: response.meta.to,
        total: response.meta.total,
        hasNext: !!response.links.next,
        hasPrevious: !!response.links.prev
    };
}

export default paginator;

// script.ts
// paginate users where column has the value of 1
const firstPage = await paginateModels(User.where<User>('column', 1));
const secondPage = await firstPage.next();

```

*Note: this isn't included in the framework by default because the package is back-end agnostic*
