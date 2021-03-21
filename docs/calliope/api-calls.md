# Api Calls

The model has the capability to interact with your api. The exact behaviour depends on the [ApiCaller](../services/readme.md#apicaller) implementation used. To facilitate some higher level methods like [touch](./timestamps.md#touch) the model provides methods equivalent to the http methods. 

## Properties

#### endpoint

The `endpoint` property is a getter which should return a string that is the or part of the address which the model can interact with. If not setting this value, the endpoint will be guessed for you. This value will be appended to the [baseEndPoint](../helpers/global-config.md#baseendpoint) from the [GlobalConfig](../helpers/global-config.md) if the `baseEndPoint` has been set.

#### loading

The `loading` property indicates whether there is an ongoing request on the model you're currently interacting with.

#### serverAttributeCasing

The `serverAttributeCasing` is a getter which similarly to [attributeCasing](./attributes.md#attributecasing) casts the request keys to the given casing on outgoing requests. The valid values are `'snake'` or `'camel'` with `'snake'` being the default value.


## Methods

::: tip
All request methods on success will call the [resetEndpoint](#resetendpoint) and will reset the all the [query parameters](./query-building.md).
:::

#### get
<Badge text="async" type="warning"/>

The `get` method initiates a new `GET` request. It optionally accepts an object which are passed to the [ApiCaller](../services/readme.md#apicaller) to transform into a query string. The method is also available statically. It returns a [Model](./readme.md) or [ModelCollection](./model-collection.md).

```js
import User from '@Models/User';

const user = new User;
user.get();
User.get();
```

#### post
<Badge text="async" type="warning"/>

The `post` method initiates a new `POST` request. It returns a [Model](./readme.md) if the endpoint returns data otherwise returns itself.

```js
import User from '@Models/User';

const user = new User;
user.post({ attribute: 1 });
```

#### put
<Badge text="async" type="warning"/>

The `put` method initiates a new `PUT` request. It returns a [Model](./readme.md) if the endpoint returns data otherwise returns itself.

```js
import User from '@Models/User';

const user = new User;
user.put({ attribute: 1 });
```

#### patch
<Badge text="async" type="warning"/>

The `patch` method initiates a new `PATCH` request. It returns a [Model](./readme.md) if the endpoint returns data otherwise returns itself.

```js
import User from '@Models/User';

const user = new User;
user.patch({ attribute: 1 });
```

#### update
<Badge text="async" type="warning"/>

The `update` method sets the correct endpoint then initiates a [patch](#patch) request.

#### delete
<Badge text="async" type="warning"/>

The `delete` method initiates a new `DELETE` request. It returns a [Model](./readme.md) if the endpoint returns data otherwise returns itself.

```js
import User from '@Models/User';

const user = new User;
user.delete({ attribute: 1 });
```

### Endpoint manipulation

There are couple utilities to change the endpoint for the next request.

#### setEndpoint

The `setEndpoint` method replaces the endpoint for the next request.
```js
import User from '@Models/User';

const user = new User;
user.getEndpoint(); // 'users'
user.setEndpoint('/something').getEndpoint(); // '/something'
```
#### getEndpoint

The `getEndpoint` method returns the current endpoint.
```js
import User from '@Models/User';

const user = new User;
user.getEndpoint(); // 'users'
```
#### resetEndpoint

The `resetEndpoint` method resets the endpoint to the original [endpoint](#endpoint). If endpoint is not set, it will try to guess it based on the model name.
```js
import User from '@Models/User';

const user = new User;
user.setEndpoint('/something').getEndpoint(); // '/something'
user.resetEndpoint('/something').getEndpoint(); // 'users'
```

#### appendToEndpoint

The `appendToEndpoint` methods appends the given string to the current endpoint.

```js
import User from '@Models/User';

const user = new User;
user.getEndpoint(); // 'users'
user.appendToEndpoint('/something').getEndpoint(); // 'users/something'
```