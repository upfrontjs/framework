# Services

Services are classes that gets delegated some responsibility by upfront. With services, it's easy to adjust upfront's behaviour without having to extend the [model](../calliope/readme.md) and write elaborate overrides. You may switch them out or extend them to fit your needs. To see how you change the implementations, visit the [global config page](../helpers/global-config.md#set).

## Service Interfaces
Services have some interfaces that they need to implement on order to work.

#### `ApiCaller`
ApiCaller an object with a `call` method defined which is utilized by all the ajax requests initiated by upfront, and it is responsible for sending a request with the given data returning a `Promise<ApiResponse>`. The arguments the `call` method takes in order are:
 - `url` - a string
 - `method` - a string representing the http method
 - `data`*(optional)* - an object or [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
 - `customHeaders`*(optional)* - an object with string keys and string or array of strings value
 - `queryParameters`*(optional)* - an object to send as query parameters in the url

#### `HandlesApiResponse`
HandlesApiResponse's task is to handle the parsing of the `Response` returned by [ApiCaller](#apicaller) and deal with any errors. It defines a `handle` method which takes a `Promise<ApiResponse>` and it should return a `Promise<any>`.

##### ApiResponse

As you might have noticed in the above service interfaces they work with an object called `ApiResponse` as opposed to a [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response). This is because this interface is more generic and can easily be implemented if deciding to use something other than the [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) api.

::: tip
Typescript users may use [module augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation) to specify what their `ApiResponse` is actually look like:
```ts
// shims/upfront.d.ts
import type { ApiResponse as BaseApiResponse } from '@upfrontjs/framework';

declare module '@upfrontjs/framework' {
    interface ApiResponse extends BaseApiResponse {
        myKey?: string;
    }
}
```
:::

---

Upfront provides the implementations for the above interfaces which should cover most use cases. If you don't set your own implementation, upfront will fall back to these default services. These classes are also available from the [global configuration]((../helpers/global-config.md)) anywhere in your application.

- [API](./api.md) - implements `ApiCaller`
- [ApiResponseHandler](./api-response-handler.md) - implements `HandlesApiResponse`


### Using Custom Services

#### Implementing interfaces
If you're thinking about creating your own service, for reference you may check out the interfaces and/or the default implementation's source code.

Creating a service is easy as:


<code-group>
<code-block title="Javascript">
```js
// MyHandler.js
import notification from 'notification-lib';

export default class MyHandler {
    handle(promise) {
        return promise.then(response => {
            if (response.status >= 300 && response.status < 400) {
                // etc...
            }
            // response handling
        })
        .catch(error => notification(error.message));
    }
}

// entry-file.js
import { GlobalConfig } from '@upfrontjs/framework';
import MyHandler from './Services/MyHandler';

new GlobalConfig({
    apiResponseHandler: MyHandler,
})
```
</code-block>

<code-block title="Typescript">
```ts
// MyHandler.ts
import type { HandlesApiResponse } from '@upfrontjs/framework';
import notification from 'notification-lib';

export default class MyHandler implements HandlesApiResponse {
    public handle(promise: Promise<Response>): Promise<any> {
        return promise
            .then(response => {
                if (response.status >= 300 && response.status <= 400) {
                    // etc...
                }
                // response handling
            })
            .catch((error) => notification(error.message))
    }
}

// entry-file.ts
import { GlobalConfig } from '@upfrontjs/framework';
import MyHandler from './Services/MyHandler';

new GlobalConfig({
    apiResponseHandler: MyHandler,
})
```
</code-block>
</code-group>

#### Extending Services
If you just want to extend a service to add some functionality like adding [initRequest()](./api.md#initrequest) to the [API](./api.md), that can be achieved like so:

<code-group>
<code-block title="Javascript">
```js
// MyHandler.js
import { ApiResponseHandler } from '@upfrontjs/framework';

export default class MyHandler extends ApiResponseHandler {
    handleFinally() {
        // any operations after the request
    }
}

// entry file.js
import { GlobalConfig } from '@upfrontjs/framework';
import MyHandler from './Services/MyHandler';

new GlobalConfig({
    apiResponseHandler: MyHandler,
})
```
</code-block>

<code-block title="Typescript">
```ts
// MyHandler.ts
import { ApiResponseHandler } from '@upfrontjs/framework';

export default class MyHandler extends ApiResponseHandler {
    public handleFinally(): void {
        // any operations after the request
    }
}

// entry file.ts
import { GlobalConfig } from '@upfrontjs/framework';
import MyHandler from './Services/MyHandler';

new GlobalConfig({
    apiResponseHandler: MyHandler,
})
```
</code-block>
</code-group>

You can find examples of testing custom services in the [Testing section](../testing.md#testing-service-implementations).
