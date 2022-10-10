# Model Collection

ModelCollection is a subclass of the [Collection](../helpers/collection.md), therefore all methods are inherited. The following methods have been updated to use either the model's [is](./readme.md#is) method, or the [primary key](./readme.md#getkey) of the model for comparison between models. `unique`, `hasDuplicates`, `duplicates`, `diff`, `only`, `except`, `intersect`, `delete`, `union`, `includes`. The signature of the before mentioned methods has not changed. In addition, the ModelCollection ensures that only [Models](./readme.md) are included in the collection. On top of the collection's methods couple of others has been added that are only relevant to model values.

## Methods

[[toc]]

#### modelKeys

The `modelKeys` method returns the [primary key](./readme.md#getkey) of the models on a Collection.
```js
import User from '@Models/User';

const modelCollection = await User.get();
modelCollection.modelKeys(); // Collection[1, 2, 3, ...ids]
```

#### findByKey

The `findByKey` method returns the Model or ModelCollection depending on the argument. The method can take the ids as a single argument or as an array or collection. Optionally you may give it a second argument which will be returned if the id is not found in the model collection.
```js
import User from '@Models/User';
import { Model } from '@upfrontjs/framework';

const defaultModel = new Model;
const modelCollection = await User.get();
modelCollection.findByKey(1); // User1
modelCollection.findByKey([1, 2]); // ModelCollection[User1, User2]
modelCollection.findByKey(43, defaultModel); // Model
```

#### isModelCollection
<Badge text="static" type="warning"/>

The `isModelCollection` static method same as the [isCollection](../helpers/collection.md#iscollection) method on the collection, is used to evaluate that the given value is a ModelCollection.
```js
import { ModelCollection, Collection } from '@upfrontjs/framework';

const modelCollection = await User.get();
ModelCollection.isModelCollection(modelCollection); // true
ModelCollection.isModelCollection([Model1, Model2]); // false
Collection.isCollection(modelCollection); // true
```

---

::: tip
The `map` method returns a ModelCollection if the return of the given callback is a [Model](./readme.md), otherwise it returns a [Collection](../helpers/collection.md).
:::
