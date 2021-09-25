# Pagination

Paginator is a utility class to help paginate data and in a clear understandable way.
To use you may construct a new instance or call the [paginate](./readme.md#paginate) helper method.

```js
import { Paginator } from '@upfrontjs/framework';

new Paginator(
    [], // optional argument of deep cloned item or array of items to be paginated
    10, // argument with default value of 10 indicating the number of items per page
    false // argument with the default value of false indicating whether the paginator wraps around or not
);
```

[[toc]]

## Properties

#### currentPage
<Badge text="read only" type="warning"/>

The `currentPage` property is an integer value indicating the paginator's current position.

#### itemsPerPage
<Badge text="read only" type="warning"/>

The `itemsPerPage` property indicates how many items are shown on a single page.

#### items

The `items` property contains the items on the current page. Navigating the paginator resets this property.

#### wrapsAround
<Badge text="read only" type="warning"/>

The `wrapsAround` property indicating whether the paginator should return to the first page when calling [next](#next) on the last page and return the last page when calling [previous](#previous) on the first page.

#### length
<Badge text="read only" type="warning"/>

The `length` property indicates how many elements there are in the paginator in total.

#### pageCount
<Badge text="read only" type="warning"/>

The `pageCount` property indicates how many pages there are based on the [itemsPerPage](#itemsperpage) and total number of elements passed to the paginator.

#### hasPrevious
<Badge text="read only" type="warning"/>

The `hasPrevious` property indicates whether there is a page before the [currentPage](#currentpage).

#### hasNext
<Badge text="read only" type="warning"/>

The `hasNext` property indicates whether there is a page after the [currentPage](#currentpage).

## Methods

#### setItemsPerPage

The `setItemsPerPage` method sets the [itemsPerPage](#itemsperpage) property and recalculates the [items](#items) property.

```js
import { Paginator } from '@upfrontjs/framework';

const paginator = new Paginator([1, 2, 3, 4, 5]);
paginator.itemsPerPage; // 10 - default
paginator.setItemsPerPag(5);
paginator.itemsPerPage; // 5
```

#### first

The `first` method sets the [currentPage](#currentpage) property to 1 and recalculates the [items](#items) property.

```js
import { Paginator } from '@upfrontjs/framework';

const paginator = new Paginator([1, 2, 3, 4, 5], 1);
paginator.currentPage; // 1
paginator.page(3).currentPage; // 1
paginator.first().currentPage; // 1
```

#### last

The `last` method sets the [currentPage](#currentpage) property to the last page and recalculates the [items](#items) property.

```js
import { Paginator } from '@upfrontjs/framework';

const paginator = new Paginator([1, 2, 3, 4, 5], 1);
paginator.currentPage; // 1
paginator.last().currentPage; // 5
```

#### page

The `page` method sets the [currentPage](#currentpage) property to the given page number if it is a valid page number and recalculates the [items](#items) property.

```js
import { Paginator } from '@upfrontjs/framework';

const paginator = new Paginator([1, 2, 3, 4, 5], 1);
paginator.currentPage; // 1
paginator.page(2).currentPage; // 2
```

#### previous

The `previous` method decrements the [currentPage](#currentpage) property if the paginator [hasPrevious](#hasprevious) page or it [wrapsAround](#wrapsaround) then recalculates the [items](#items) property.

```js
import { Paginator } from '@upfrontjs/framework';

let paginator = new Paginator([1, 2, 3, 4, 5], 1);
paginator.previous().currentPage; // 1
paginator.page(3).previous().currentPage; // 2

paginator = new Paginator([1, 2, 3, 4, 5], 1, true);
paginator.previous().currentPage; // 5
```

#### next

The `next` method increments the [currentPage](#currentpage) property if the paginator [hasNext](#hasnext) page or it [wrapsAround](#wrapsaround) then recalculates the [items](#items) property.

```js
import { Paginator } from '@upfrontjs/framework';

let paginator = new Paginator([1, 2, 3, 4, 5], 1);
paginator.last().next().currentPage; // 5
paginator.page(3).next().currentPage; // 4

paginator = new Paginator([1, 2, 3, 4, 5], 1, true);
paginator.last().next().currentPage; // 1
```

#### pageNumberOf

The `pageNumberOf` method returns the page number where the given item first occurs. The comparison uses deep equality. If item not found, returns `-1`.

```js
import { Paginator } from '@upfrontjs/framework';

let paginator = new Paginator([1, 2, 3, 2, 5], 2);
paginator.pageNumberOf(2); // 1

paginator.pageNumberOf('value'); // -1
```

#### isOnPage

The `isOnPage` method returns determines whether the given item is on the [currentPage](#currentpage). The comparison uses deep equality.

```js
import { Paginator } from '@upfrontjs/framework';

let paginator = new Paginator([1, 2, 3, 4, 5], 1);
paginator.isOnPage(2); // false
paginator.next().isOnPage(2); // true
```

#### jumpToItem

The `jumpToItem` method sets the page number where the given item is first found. The comparison uses deep equality. If the item is not found, this will throw an error.

```js
import { Paginator } from '@upfrontjs/framework';

let paginator = new Paginator([1, 2, 3, 4, 5], 1);
paginator.jumpToItem(3).currentPage; // 3
paginator.jumpToItem('value'); // InvalidOffsetException: Given item does not exists on the paginator
```

#### push

The `push` method pushes 1 or more elements to the end of the paginator. It returns the new total number of items in the paginator.

```js
import { Paginator } from '@upfrontjs/framework';

let paginator = new Paginator([1, 2, 3, 4, 5], 1);
paginator.last().hasNext(); // false
paginator.push(6);
paginator.hasNext(); // true
```


#### pop

The `pop` method removes the last element of the paginator. If the paginator is on the last page, and the page only contains the item, it will go to the previous page.

```js
import { Paginator } from '@upfrontjs/framework';

let paginator = new Paginator([1, 2, 3, 4, 5], 1);
paginator.last().currentPage; // 5
paginator.pop();
paginator.items; // [4]
paginator.currentPage; // 4
```

#### unshift

The `unshift` method pushes 1 or more elements to the start of the paginator. It returns the new total number of items in the paginator.

```js
import { Paginator } from '@upfrontjs/framework';

let paginator = new Paginator([1, 2, 3, 4, 5], 1);
paginator.items; // [1]
paginator.unshift(0);
paginator.items; // [0]
```

#### shift

The `shift` method removes the first element of the paginator. If the paginator is on the last page, and the page only contains the item, it will go to the previous page.

```js
import { Paginator } from '@upfrontjs/framework';

let paginator = new Paginator([1, 2, 3, 4, 5], 1);
paginator.last().currentPage; // 5
paginator.shift();
paginator.items; // [5]
paginator.currentPage; // 4
```


#### getAll

The `getAll` method returns a deep copy of all items currently in the paginator.

```js
import { Paginator } from '@upfrontjs/framework';

let paginator = new Paginator([1, 2, 3, 4, 5], 1);
paginator.getAll(); // [1, 2, 3, 4, 5]
```

#### getPages

The `getPages` method returns a deep copy of all items currently in the paginator in a 2 dimensional array, where every array is a page.

```js
import { Paginator } from '@upfrontjs/framework';

let paginator = new Paginator([1, 2, 3, 4, 5], 1);
paginator.getPages(); // [[1], [2], [3], [4], [5]]
```
