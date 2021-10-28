# API

API is responsible for handling the actual ajax requests sent by upfront. It is a class that implements the [ApiCaller](./readme.md#apicaller) interface with the required `call` method.
It offers the following customisations if you decide to extend the service.

### `requestOptions`
This is an optional property on the API class which should have the value of `Partial<RequestInit>`. This is merged into the request if defined.

### `initRequest()`
This is an optional method that returns `Partial<RequestInit> | Promise<Partial<RequestInit>>`. It takes 3 parameters, in order the `url` - the endpoint to send the request to; the `method` - the http method; and optionally the `data` - which is an object literal or `FormData`.

### `getParamEncodingOptions`
When the API receives some data to send as a request, it utilises the [qs](https://github.com/ljharb/qs) package to encode the object into query parameters. This object is the configuration ([`qs.IStringifyOptions`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/0b5bfba2994c91a099cd5bcfd984f6c4c39228e5/types/qs/index.d.ts#L20)) object for the package. The typings for this package is an optional dependency of upfront, so you may choose not to include it in your development.

---
Furthermore, it was built to support sending form data. This means it accepts a [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) object, and it will configure the headers for you.

## RequestInit resolving

The API prepares the `RequestInit` configuration in the following order:
 1. `RequestInit` created with the `method` argument
 2. Merge the `requestOptions` property into the `RequestInit`
 3. Merge the `initRequest()` method's result into the `RequestInit`
 4. Merge in any headers from the [GlobalConfig](../helpers/global-config.md) into the `RequestInit`
 5. Set the `Content-Type` header to the appropriate value if not already set.
 6. Update the url with any query parameter if needed.
 7. Merge in the headers from the [`ApiCaller`](./readme.md#apicaller)'s `call` method's `customHeaders` argument into the `RequestInit`
 8. Set the `Accept` header to `application/json` if not already set.

## Shape of the request

This part applies if you're not using a custom, customising the `API` service or [customising the query string in the builder](../calliope/query-building.md#customising-the-generated-query-string). Deviation from this, like adjusting the [getParamEncodingOptions](#getparamencodingoptions) or [implementing a custom service](./readme.md#using-custom-services) will cause different results.
With the default settings, your api has to be ready to parse the requests with the following format.

A sample get request `User.whereKey(1).get()` will encode to the following:

```http request
GET https://test-api-endpoint.com/users?wheres[][column]=id&wheres[][operator]=%3D&wheres[][value]=1&wheres[][boolean]=and
Content-type: application/x-www-form-urlencoded, charset=utf-8
Accept: application/json 
```

Which is the equivalent of [baseEndPoint](../helpers#baseendpoint) + [endpoint](../calliope/api-calls.md#endpoint) + the following object in the get parameters:
```js
{
    wheres: [
        { column: 'id', operator: '=', value: 1, boolean: 'and' }
    ]
}
```

On all other requests where the body is allowed the above object will be sent in the main body.

### Query types
The full typings for the possible values is the following:
```ts
type BooleanOperator = 'and' | 'or';
type Direction = 'asc' | 'desc';
type Operator = '!=' | '<' | '<=' | '=' | '>' | '>=' | 'between' | 'in' | 'like' | 'notBetween' | 'notIn';
type Order = { column: string; direction: Direction };
type WhereDescription = {
    column: string;
    operator: Operator;
    value: any;
    boolean: BooleanOperator;
};
type QueryParams = Partial<{
    wheres: WhereDescription[]; // where the row tests true these conditions
    columns: string[]; // select only these columns
    with: string[]; // return with these relations
    scopes: string[]; // apply these scopes
    relationsExists: string[]; // only return if these relations exists
    orders: Order[]; // return records in this order
    distinctOnly: boolean; // return unique records only
    offset: number; // skip this many records
    limit: number; // limit the number of records to this
}>;
```

Furthermore:
 1. The backend should be able to parse the `WhereDescription['column']` into the relation on the backend if the following format is found `'shifts.start_time'`. This example will mean that we're interested in the `start_time` column on the `shifts` relation.
   ::: danger
   This is required to implement if you're using the [belongsToMany](../calliope/relationships.md#belongstomany) method. However, if not using the `belongsToMany` and not using the [where methods](../calliope/query-building.md#where) like `User.where('relation.column', 1).get()`, you don't have to implement.
   :::
 2. The backend should recognise if the `withs` contains the string `'*'` it means all relations are requested.
   ::: danger
   This is required to implement if you're using the [morphTo](../calliope/relationships.md#morphto) method. However, if not using the `morphTo` method, you don't have to implement.
   :::


