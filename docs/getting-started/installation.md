# Installation

<code-group>
<code-block title="npm">
```shell
npm install @upfrontjs/framework
```
</code-block>

<code-block title="yarn">
```shell
yarn install @upfrontjs/framework
```
</code-block>
</code-group>

The library is transpiled to ES6 (currently the lowest supported version), but if you're using [Typescript](https://www.typescriptlang.org/), you could choose to use the source `.ts` files. To do so, import files from `/src` folder as opposed to the library root.
```js
import { Model } from '@upfrontjs/framework';
```
vs
```ts
import { Model } from '@upfrontjs/framework/src';
```

This way you can deliver the files with the correct optimisation to your audience.

::: tip
Instead of writing `'@upfrontjs/framework/src'` at every import you could choose to alias it to something shorter like `'@upfrontjs'` in the bundler of your choice. (If doing so, don't forget to add the aliases to your typescript and test runner configuration too if applicable.)
:::

## Optional steps
Add your base [endpoint](../helpers/global-config.md#baseendpoint) to the [configuration](../helpers/global-config.md) in your entry file like so:
```js
import { GlobalConfig } from '@upfrontjs/framework';

new GlobalConfig({
    baseEndPoint: 'https://your-api-endpoint.com'
})
```

If you have any custom [service](../services/readme.md) implementations add them to the configuration:
```js
import { GlobalConfig } from '@upfrontjs/framework';
import MyHandler from './Services/MyHandler';

new GlobalConfig({
    apiResponseHandler: MyHandler,
})
```

## Backend requirements

There are 2-3 requirements that needs to be fulfilled by the server in order for this package to work as expected. These are the:
 - **Parsing the request**
   - Your server should be capable of parsing the query string or request body sent by upfront. The shape of the request depends on the used [ApiCaller](../services/readme.md#apicaller) implementation. Users with REST apis using the default [API](../services/api.md) service may also take a look at the [anatomy of the request](../services/api.md#shape-of-the-request) the service generates.
 - **Responding with appropriate data**
   - The returned data should be representative of the query string/body.
   - It is in a format that the used [HandlesApiResponse](../services/readme.md#handlesapiresponse) implementation can parse into an object or array of objects.
 - **Endpoints defined**
   
   If using a REST api and the default [API](../services/api.md) service:
   - Your server should implement the expected REST endpoints which are the following using the example of a users:
      - `GET users/` - index endpoint returning all users.
      - `POST users/` - endpoint used for saving the user data.
      - `GET users/{id}` - get a single user.
      - `PUT/PATCH users/{id}` - endpoint used to update partially or in full the user data.
      - `DELETE users/{id}` - delete a single user.

::: tip
Note that if you expect to experience high traffic for some unique data, you should probably still write a dedicated endpoint for it, instead of parsing the query and letting an ORM figure it out.
:::
