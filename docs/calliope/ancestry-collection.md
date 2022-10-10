# Ancestry Collection

Sometimes you may encounter data structures that are meant to be sorted based on their relation to each other. For example messages and their replies, folders and their sub folders, tasks and their subtasks, etc... However,sometimes the data sources might not return the data in an easily digestible structured format but a flat array.

For these occasions you may use the AncestryCollection. An ancestry collection is a subclass of the [ModelCollection](./model-collection.md), therefore all methods are inherited. Keep in mind that inherited methods will be operating on the top level items as one might expect.

## Properties

#### depthName
<Badge text="static" type="warning"/>

This string determines the name of the attribute that is set on the models when constructing the collection using the [treeOf](#treeof) method.

## Methods

[[toc]]

#### treeOf
<Badge text="static" type="warning"/>

The `treeOf` static method creates the AncestryCollection from the given [ModelCollection](./model-collection.md). This arranges the models to as the child of their respective models. Optionally the method takes 2 more arguments:
- `parentKey` (default: `'parentId'`) -  the name of the attribute that contains the parent's identifier.
- `childrenRelation` (default: `'children'`): - the name of the relation the child models are nested under.

This will also assign the [depth](#depthname) value to the model based on its position on the tree.
```js
import { AncestryCollection } from '@upfrontjs/framework';
import Folder from '~/Models/Folder';

const folders = await Folder.get();
const folderTree = AncestryCollection.treeOf(folders);
```

#### flatten

The `flatten` method deconstructs the tree to a flat [ModelCollection](./model-collection.md).

```js
import { AncestryCollection } from '@upfrontjs/framework';
import Folder from '~/Models/Folder';

const folders = await Folder.get();
const folderTree = AncestryCollection.treeOf(folders);

folderTree.flatten(); // ModelCollection
```

#### leaves

The `leaves` method returns a [ModelCollection](./model-collection.md) containing all the models that does not have any children. With the analogy of a tree, it will not include roots, branches, only the models at the end of the bloodline.

```js
import { AncestryCollection } from '@upfrontjs/framework';
import Folder from '~/Models/Folder';

const folders = await Folder.get();
const folderTree = AncestryCollection.treeOf(folders);

folderTree.leaves(); // ModelCollection
```

#### isAncestryCollection
<Badge text="static" type="warning"/>

The `isAncestryCollection` static method same as the [isModelCollection](./model-collection.md#ismodelcollection) method on the ModelCollection, is used to evaluate that the given value is an AncestryCollection.
```js
import { AncestryCollection, ModelCollection, Collection } from '@upfrontjs/framework';
import Folder from '~/Models/Folder';

const modelCollection = await Folder.get();
const folderTree = AncestryCollection.treeOf(modelCollection);

AncestryCollection.isAncestryCollection(modelCollection); // false
AncestryCollection.isAncestryCollection(folderTree); // true

ModelCollection.isModelCollection(folderTree); // true
Collection.isCollection(folderTree); // true
```
