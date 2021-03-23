# Timestamps

Timestamps are a feature of the model used for tracking changes on your entities. With it, you can check when was the model soft deleted, created or last updated.

## Timestamps

### Properties

#### createdAt

The `createdAt` is a static property on the model. The default value is `'createdAt'`. You may over ride this if the expected timestamp attribute is named differently.
The letter casing is no concern here as [getCreatedAtColumn](#getcreatedatcolumn) will update it to the correct casing.

#### updatedAt

The `updatedAt` is a static property on the model. The default value is `'updatedAt'`. You may over ride this if the expected timestamp attribute is named differently.
The letter casing is no concern here as [getUpdatedAtColumn](#getupdatedatcolumn) will update it to the correct casing.

#### timestamps

The `timestamps` is a read only attribute that signifies whether the model uses timestamps or not. The default value is `true`;

### Methods

#### getCreatedAtColumn

The `getCreatedAtColumn` method returns the value of the static [createdAt](#createdat) value with the letter casing set to the given [attributeCasing](./attributes.md#attributecasing).

#### getUpdatedAtColumn

The `getUpdatedAtColumn` method returns the value of the static [updatedAt](#updatedat) value with the letter casing set to the given [attributeCasing](./attributes.md#attributecasing).

#### usesTimestamps

The `usesTimestamps` method returns the value of the [timestamps](#timestamps-3)

#### touch
<Badge text="async" type="warning"/>

The `touch` method sends a `PATCH` request with the new [updatedAt](#getupdatedatcolumn) attribute value. It updates the attribute from the response data.

::: tip
Your backend should probably not trust this input, but generate its own timestamp.
:::

#### freshTimestamps
<Badge text="async" type="warning"/>

The `freshTimestamps` method sends `GET` request [selecting](./query-building.md#select) only the [createdAt](#getcreatedatcolumn) and [updatedAt](#getupdatedatcolumn) attributes, which are updated from the response on success.

## Soft Deletes

### Properties

##### deletedAt

The `deletedAt` is a static property on the model. The default value is `'deletedAt'`. You may over ride this if the expected timestamp attribute is named differently.
The letter casing is no concern here as [getDeletedAtColumn](#getdeletedatcolumn) will update it to the correct casing.

#### softDeletes

The `softDeletes` is a read only attribute that signifies whether the model uses soft deleting or not. The default value is `true`;

#### trashed

The `trashed` is a getter property that returns a boolean depending on whether the model has the [deletedAt](#getdeletedatcolumn) set to a truthy value.

### Methods

#### getDeletedAtColumn

The `getDeletedAtColumn` method returns the value of the static [deletedAt](#deletedat) value with the letter casing set to the given [attributeCasing](./attributes.md#attributecasing).

#### usesSoftDeletes

The `usesSoftDeletes` method returns the value of the [softDeletes](#softdeletes)

#### delete
<Badge text="async" type="warning"/>

 The `delete` method is an extension of the api calling method [delete](./api-calls.md#delete). If the model is not [using softDeletes](#usessoftdeletes) the logic will fall back to the original [delete](./api-calls.md#delete) method's logic therefore, method accepts an optional object argument which will be sent along on the request in the body.

This method sends a `DELETE` request with the new [deletedAt](#getdeletedatcolumn) attribute value. It updates the attribute from the response data.

::: tip
Your backend should probably not trust this input, but generate its own timestamp.
:::

#### restore
<Badge text="async" type="warning"/>

The `restore` methods sends a `PATCH` request with the nullified [deletedAt](#getdeletedatcolumn) attribute value. It updates the attribute to `null` on successful request.


