# Introduction

## What is it?
It's a model centric data handling solution. With it, you can write expressive, readable, concise syntax that you already know and love from back-end MVC frameworks while staying back-end agnostic. It provides an elegant structure to complex data with a plethora of features to manage the data, and additional helpers for common tasks like handling lists, pagination, string manipulation etc.

```ts
import User from '@models/User';

const students = await User.where('is_student', true).with('grades').get();

const excellentStudentNames = students
    .filter(student => student.grades.average('value') > 4)
    .pluck('name');
```

```ts
import User from '@models/User';

const students = await User.where('is_student', true).with('grades').get();

const excellentStudentNames = students
    .filter(student => student.grades.average('value') > 4)
    .pluck('name');
```

## What does it solve?
There are number of solutions out there for fetching data and working with the response. However not all of these might be as scalable as one would hope. With state management, you might have a getter for users, but those users include all users, meaning for a custom collection you would need a new getter method. An on-demand ajax request written specifically to solve a single issue, while it is simple to do, it quickly gets repetitive and hard to maintain. [Upfront](./installation.md) solves the above by creating abstraction over the data in a unified api. Just like the above examples it can be used to fetch data on demand or be complimentary to state management libraries.

## Caveats
While using this package increases ease of access and cuts down development time, it can also have unintended consequences. By pushing more logic to the client side you may expose backend logic such as data relations. Furthermore, if you're incorrectly implementing the [backend requirements](./installation.md#backend-requirements) you may introduce vulnerabilities such as sql injection.

---

As always you're encouraged to explore the [source](https://github.com/upfrontjs/framework) yourself or look at the api reference to gain insight on how the package works, and the tests to see how it's used.

