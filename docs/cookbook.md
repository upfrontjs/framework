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
- [Using it with automated query builder packages](#using-it-with-automated-query-builder-packages)
- [Send paginated requests](#send-paginated-requests)

#### Extend the collections to fit your needs.
Don't be afraid of changing and overriding methods if that solves your problem. The aim is to make development a breeze.

<CodeGroup>

<CodeGroupItem title="Javascript">

```js
// UserCollection.js
import User from '@models/User';
import { ModelCollection } from '@upfrontjs/framework';

export default class UserCollection extends ModelCollection {
    areAwake() {
        return this.filter(user => user.wokeUp && user.hadBeverage('hot'));
    }
    
    async markAsReady() {
        return User.whereKey(this.modelKeys()).patch({ ready: true });
    }
}

// my-file.js
import User from '@models/User';
import UserCollection from '@/UserCollection';

const users = await User.latest()
    .limit(10)
    .get()
    .then(users => new UserCollection(users.toArray()));

if (users.areAwake().length === users.length) {
    await users.markAsReady();
} else {
    console.log('Oh no, somebody\'s not ready yet!');
}
```
</CodeGroupItem>

<CodeGroupItem title="Typescript">

```ts
// UserCollection.ts
import User from '@models/User';
import { ModelCollection } from '@upfrontjs/framework';

export default class UserCollection<T extends User = User> extends ModelCollection<T> {
    public areAwake(): ModelCollection<T> {
        return this.filter(user => user.wokeUp && user.hadBeverage('hot'));
    }

    public async markAsReady(): ModelCollection<T> {
        return User.whereKey(this.modelKeys()).patch({ ready: true });
    }
}

// my-file.ts
import User from '@models/User';
import UserCollection from '@/UserCollection';

const users = await User.latest()
    .limit(10)
    .get()
    .then(users => new UserCollection(users.toArray()));

if (users.areAwake().length === modelCollection.length) {
    await users.markAsReady();
} else {
    console.log('Oh no, somebody\'s not ready yet!');
}
```
</CodeGroupItem>

</CodeGroup>

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
        'POST',
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
import type { FormatsQueryParameters, QueryParams, StaticToThis } from '@upfrontjs/framework';
import { Model as BaseModel } from '@upfrontjs/framework';

type Appendage = string;

export default class Model extends BaseModel implements FormatsQueryParameters {
    protected appends: string[] = [];

    public append(name: Appendage): this {
        this.appends.push(name);
        return this;
    }

    public static append<T extends StaticToThis<Model>>(this: T, name: Appendage): T['prototype'] {
        this.newQuery().append(name);
    }

    public withoutAppend(name: Appendage): this {
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

#### Using it with automated query builder packages

For even more convenience the package can be adjusted to be used with some sort of automated query parsing code on the backend.
Closely similar to [query builder extending](#extend-query-builder-functionality) you may create a more generalised approach to allow setting such query params.

```ts
import type { AttributeKeys, FormatsQueryParameters, StaticToThis, QueryParams } from '@upfrontjs/framework';
import { Model as BaseModel } from '@upfrontjs/framework';

// example query parameters the back-end might be looking for.
interface RequestParameters extends Record<string, unknown> {
    /**
     * Append these values if set.
     */
    append?: string[];
    /**
     * Return with these relations if set.
     */
    include?: (string | `${string}Count`)[];
    /**
     * Return only these fields if set.
     */
    fields?: string[];
    /**
     * Only return records where these filters return true when this is set.
     */
    filter?: Record<string, string>;
    /**
     * Sort by this property if set.
     */
    sort?: string;
}

export default class Model extends BaseModel implements FormatsQueryParameters {
    /**
     * The parameters that should be sent along in the next request.
     *
     * @protected
     */
    protected requestParameters: RequestParameters = {};

    /**
     * Set url parameters for the next request.
     */
    public withParameter(params: RequestParameters): this {
        this.requestParameters = Object.assign(this.requestParameters, params);

        return this;
    }

    /**
     * Static version of the withParameter method.
     *
     * @param {RequestParameters} params
     */
    public static withParameters<T extends StaticToThis<Model>>(this: T, params: RequestParameters): T['prototype'] {
        return new this().withParameter(params);
    }

    /**
     * @inheritDoc
     */
    public resetQueryParameters(): this {
        this.requestParameters = {};

        return super.resetQueryParameters();
    }

    /**
     * @inheritDoc
     *
     * @protected
     */
    public formatQueryParameters(parameters: QueryParams & Record<string, any>): Record<string, any> {
        return Object.assign(parameters, this.requestParameters);
    }
}
```

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

async function paginatedModels<T extends Model>(
    builder: T | (new() => T),
    page = 1,
    limit = 25
): Promise<PaginatedModels<T>> {
    const instance = builder instanceof Model ? builder.clone() : new builder();
    
    const response = await instance.limit(limit).page(page).call<PaginatedApiResponse<Attributes<T>>>('GET');
    const modelCollection = new ModelCollection<T>(
        response!.data.map(attributes => instance.new(attributes).setLastSyncedAt())
    );

    return {
        data: modelCollection,
        next: async () => {
            if (!response.links.next) return;
            return paginatedModels(instance, page + 1, limit);
        },
        previous: async () => {
            if (!response.links.prev) return;
            return paginatedModels(instance, page - 1, limit);
        },
        page: async (pageNumber: number) => {
            if (pageNumber > response.meta.last_page || pageNumber < 0) return;
            return paginatedModels(instance, pageNumber, limit);
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
const firstPage = await paginateModels(User.where('column', 1));
const secondPage = await firstPage.next();

```

*Note: this isn't included in the framework by default because the package is back-end agnostic*
