# Global config

GlobalConfig is an in-memory store for all your globally needed configuration values.

::: danger
Wherever you import your config, the configuration previously set will be present in the imported GlobalConfig.
:::

The config serves as container for some [pre-defined keys](#configuration) that you may set that upfront can later use, and to be used in your script to the same extent.

To use, just instantiate a `new GlobalConfig`, and you're ready to interact with your existing configuration by the [available methods](#methods).

::: tip
For typescript users it might be advisable to export your configuration from a single place to take advantage from the type hinting your own configuration provides.
```ts
import { GlobalConfig } from '@upfrontjs/framework';
import type { MyConfiguration } from './types'

const config: GlobalConfig<MyConfiguration> = new GlobalConfig({});
export { config };
```
:::

[[toc]]

## Methods

#### constructor

The class constructor takes a [configuration](#configuration) object which gets deep merged into the existing configuration if any.

::: warning
All values that are not `typeof value === 'function'` will be cloned, therefore you cannot change object literals in the config by reference.
:::

#### set

The set method sets the given value in the config.
```js
config.set('key', 'value');

config.has('key'); // true
```
::: warning
All values that are not `typeof value === 'function'` will be cloned, therefore you cannot change object literals in the config by reference.
:::

#### get

The get method returns the requested value. If the key not found it returns the second optional parameter, which is the default value.
```js
config.set('key', 'value');

config.get('key'); // 'value'
config.get('nonExistentKey'); // undefined
config.get('nonExistentKey', 1); // 1
```
::: warning
All values that are not `typeof value === 'function'` will be cloned, therefore you cannot change object literals in the config by reference.
:::

#### has

The get method determines whether the given key is set in the config.

```js
config.has('key'); // false

config.set('key', 'value');

config.has('key'); // true
```

#### unset

The unset method removes the given key from the config.

```js
config.set('key', 'value');
config.unset('key');

config.has('key'); // false
```

#### reset

The reset method removes all the values from the config.
```js
config.set('key', 'value');
config.reset();

config.has('key'); // false
```

## Configuration

Configuration is an interface describing some predefined keys, all of which are optional. If a configuration is given to the GlobalConfig, and any of the pre-defined keys are present, they must match the type set in the Configuration.
The following keys are present:

#### api

This value if set, will be used in the model [on requests](../calliope/api-calls.md).
It must implement the [ApiCaller](../services/readme.md#apicaller) interface.

#### apiResponseHandler

This value if set, will be used in the model [on requests](../calliope/api-calls.md).
It must implement the [HandlesApiResponse](../services/readme.md#handlesapiresponse) interface.

#### datetime

This value if set, will be used by to [cast values](../calliope/attributes.md#casting)  to the date-time library of your choice, if casting is configured on the model. This has to be either a function which will be called with the value `dateTime(attribute)` or a class with will be constructed with the value e.g.: `new DateTime(attribute)`

#### headers

This value if set will be merged into the request headers by the [API](../services/api.md) service class if that service is used. This value has to match the type of `HeadersInit`.

#### baseEndPoint
This is a `string` that the [model's endpoint](../calliope/api-calls.md#endpoint) will be prefixed by on requests. Example value would be: `'https://my-awesome-api.com'`.

#### randomDataGenerator

This value if set, it will be available for consuming in your [Factories](../testing.md#factories) under the member key [random](../testing.md#random).
