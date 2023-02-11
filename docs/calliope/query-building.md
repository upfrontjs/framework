# Query Building

Query building a major aspect of requesting data that you require. With it, you could translate your data requirement for example:

> Get all users who have a shift starting tomorrow between 6am and 10am.

Into something similar to:
```js
const morningWorkers = await User
    .has(['shifts'])
    .whereBetween('shifts.starts_at', [tomorrow().hour(6).toISOString(), tomorrow().hour(10).toISOString()])
    .get();
```

Which will generate request url similar to the described [Shape of the request](../services/api.md#shape-of-the-request) the [API](../services/api.md) service class generates.

## Customising the generated query string

Given the above may not follow the desired namings for the parameters, you could customise the result by implementing the provided `FormatsQueryParameters` interface.

```ts
// User.ts
import { Model, FormatsQueryParameters, QueryParams } from "@upfrontjs/framework";

export default class User extends Model implements FormatsQueryParameters {
    /**
     * Transform the default query string keys.
     *
     * @param {QueryParams} parameters
     */
    public formatQueryParameters(parameters: QueryParams): Record<string, any> {
        if (parameters.wheres) {
            parameters.filters = parameters.wheres;
            delete parameters.wheres;
        }
        
        return parameters;
    }
}
```

With the above now instead of using the `wheres` keyword in the query string it will now be `filters`.

## Methods

The below methods are all available both on the instance and statically on the models. Exceptions are the methods starting with `or`. They're only available on the instance.
```js
import User from '@Models/User';

User.where(...); // correct
(new User).where(...); // correct

User.orWhere(...); // incorrect
(new User).orWhere(...); // correct
```

All methods return the instance allowing chaining.

---

[[toc]]

### Wheres

---

#### where

The `where` method adds a [where query](../services/api.md#query-types) to the next request. It takes 2-4 arguments. If 2 arguments given the operator assumed to be `'='` and the boolean operator to be `'and'`. The arguments in order are the `column`, `operator/value`, `value`, `boolean`.

```js
import User from '@Models/User';

User.where('column', '=', 1, 'and');
// same as
User.where('column', 1);
```

#### orWhere

The `orWhere` method adds a [where query](../services/api.md#query-types) to the next request with the boolean operator set to `'or'`.

```js
import User from '@Models/User';

User.where('column', 1).orWhere('column', 2);
```

#### whereKey

The `whereKey` method adds a [where query](../services/api.md#query-types) to the next request with the column set to the value of the [getKeyName](./readme.md). You may give the method a single, or an array of numbers or strings.

```js
import User from '@Models/User';

User.whereKey(1);
User.whereKey('3c1513e5-924e-47d2-bf4b-e6baf9adf2f9');
```

#### orWhereKey

The `orWhereKey` method adds a [where query](../services/api.md#query-types) to the next request with the column set to the value of the [getKeyName](./readme.md) and the boolean operator set to `'or'`. You may give the method a single, or an array of numbers or strings.

```js
import User from '@Models/User';

User.whereKey(1).orWhereKey(1);
```

#### orWhereKeyNot

The `orWhereKeyNot` method adds a [where query](../services/api.md#query-types) to the next request with the column set to the value of the [getKeyName](./readme.md) and the boolean operator set to `'or'` and the operator to `'!='`. You may give the method a single, or an array of numbers or strings.

```js
import User from '@Models/User';

User.orWhereKeyNot(1);
```

#### whereNull

The `whereNull` method adds a [where query](../services/api.md#query-types) to the next request with the value set to `'null'`. You may give the method a single, or an array of numbers or strings.

```js
import User from '@Models/User';

User.whereNull('column');
```

#### orWhereNull

The `orWhereNull` method adds a [where query](../services/api.md#query-types) to the next request with the value set to `'null'` and the boolean operator set to `'or'`. You may give the method a single, or an array of numbers or strings.

```js
import User from '@Models/User';

User.orWhereNull('column');
```

#### orWhereNotNull

The `orWhereNotNull` method adds a [where query](../services/api.md#query-types) to the next request with the value set to `'null'`, the boolean operator set to `'or'` and the operator set to `'!='`. You may give the method a single, or an array of numbers or strings.

```js
import User from '@Models/User';

User.orWhereNotNull('column');
```

#### whereIn

The `whereIn` method adds a [where query](../services/api.md#query-types) to the next request with the operator set to `'in'`.

```js
import User from '@Models/User';

User.whereIn('column', [1, 2, 3]);
```

#### orWhereIn

The `orWhereIn` method adds a [where query](../services/api.md#query-types) to the next request with the operator set to `'in'` and the boolean operator set to `'or'`.

```js
import User from '@Models/User';

User.orWhereIn();
```

#### whereNotIn

The `whereNotIn` method adds a [where query](../services/api.md#query-types) to the next request with the operator set to `'notIn'`.

```js
import User from '@Models/User';

User.whereNotIn();
```

#### orWhereNotIn

The `orWhereNotIn` method adds a [where query](../services/api.md#query-types) to the next request with the operator set to `'notIn'` and the boolean operator set to `'or'`.

```js
import User from '@Models/User';

User.orWhereNotIn();
```

#### whereBetween

The `whereBetween` method adds a [where query](../services/api.md#query-types) to the next request with the operator set to `'between'`.

```js
import User from '@Models/User';

User.whereBetween('column', [1, 3]);
```

#### orWhereBetween

The `orWhereBetween` method adds a [where query](../services/api.md#query-types) to the next request with the operator set to `'between'` and the boolean operator set to `'or'`.

```js
import User from '@Models/User';

User.orWhereBetween('column', [1, 3]);
```

#### whereNotBetween

The `whereNotBetween` method  adds a [where query](../services/api.md#query-types) to the next request with the operator set to `'notBetween'`

```js
import User from '@Models/User';

User.whereNotBetween('column', [1, 3]);
```

#### orWhereNotBetween

The `orWhereNotBetween` method  adds a [where query](../services/api.md#query-types) to the next request with the operator set to `'notBetween'` and the boolean operator set to `'or'`.

```js
import User from '@Models/User';

User.orWhereNotBetween('column', [1, 3]);
```

### Miscellaneous

---

#### limit

The `limit` method adds a limit constraint to the next request indicating that only this many records are expected.

```js
import User from '@Models/User';

User.limit(5);
```

#### distinct

The `distinct` method adds a distinct parameter for the request where the returned rows are expected to be distinct by the given columns.

```js
import User from '@Models/User';

User.distinct('column1');
User.distinct(['column1', 'column2']);
```

#### select

The `select` method indicates to the backend that only the following columns/properties are expected to be returned from the record.

```js
import User from '@Models/User';

User.select('id');
User.select(['id', 'name']);
```

#### has

The `has` method adds a constraint to the next request indicating to only return records that has existing relations for the given relation name.

```js
import User from '@Models/User';

User.has('shifts');
```

#### with

The `with` method indicates to the backend to return the records with the given relations.

```js
import User from '@Models/User';

User.with('shifts');
User.with(['shifts', 'team']);
```

#### without

The `without` method indicates to the backend to return the records without the given relations in case it always returns with them.

```js
import User from '@Models/User';

User.without('shifts');
User.without(['shifts', 'team']);
```

#### scope

The `scope` method indicated to the backend to apply the given scopes/filters to your query.

```js
import User from '@Models/User';

User.scope('experiencedDriver');
```

#### orderBy

The `orderBy` method indicates to the backend to order the returned records by the given column in the given direction. The second argument can take 2 possible values: `'asc'` and `'desc'` with `'asc'` being the default value.

```js
import User from '@Models/User';

User.orderBy('column');
User.orderBy('column', 'desc');
```

#### orderByDesc

The `orderByDesc` method indicates to the backend to order the returned records by the given column in descending order.

```js
import User from '@Models/User';

User.orderByDesc('column');
```

#### latest

The `latest` method is an alias of the [orderBy](#orderby) method using a descending order. You may optionally specify which column to order by with the default being the result of the [getCreatedAtName](./timestamps.md#getcreatedatname) method.

```js
import User from '@Models/User';

User.latest();
User.latest('signed_up_at');
```

#### oldest

The `oldest` method is an alias of the [orderBy](#orderby) method using an ascending order. You may optionally specify which column to order by with the default being the result of the [getCreatedAtName](./timestamps.md#getcreatedatname) method.

```js
import User from '@Models/User';

User.oldest();
User.oldest('signed_up_at');
```

#### offset

The `offset` method indicates to the backend to return the records starting from the given offset.

```js
import User from '@Models/User';

User.offset(10);
```

#### skip

The `skip` method is an alias of the [offset](#offset) method

```js
import User from '@Models/User';

User.skip(10);
```

#### newQuery
<Badge text="static only" type="warning"/>

The `newQuery` is a static method that returns the builder. You're not expected to use this as builder all methods are already available statically as well. However, if you still find that there are methods not available statically (like your own methods) you can use this.

```js
import User from '@Models/User';

User.newQuery(); // The query builder
```

#### resetQueryParameters

The `resetQueryParameters` is a method that clears all previously set query parameters.

```js
import User from '@Models/User';

const user = new User();
void user.where('columns', 'value').get(); // would send the where query
void user.where('columns', 'value').resetQueryParameters().get(); // would NOT send any query
```

## Properties

#### withRelations

The `withRelations` is a property that specifies which relations should be set to be included in every request. It merges the unique values set by the [with](#with) method and removes the values specified by the [without](#without) method.

```js
// User.js
import { Model } from '@upfrontjs/framework';

export default class User extends Model {
    withRelations = [
        'relation1',
        'relation2'
    ];
}
```
