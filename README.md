<p align="center">
  <img width="400" src="https://raw.githubusercontent.com/upfrontjs/design/main/upfrontjs.png">
</p>

![GitHub release (latest SemVer including pre-releases)](https://img.shields.io/github/v/release/upfrontjs/framework?color=%233ac200&include_prereleases&label=latest%20version&sort=semver&style=flat-square)
![Github stars](https://img.shields.io/github/stars/upfrontjs/framework?color=blue&label=github%20stars&style=flat-square)
![Npm Downloads](https://img.shields.io/npm/dm/@upfrontjs/framework?label=npm%20downloads&style=flat-square&color=blue)

<p align="center">
  Upfront is modern, scalable data handling solution for the web. Easily manage complex data without compromising developer experience.
</p>

#### Find out more about upfront over in the [documentation](https://www.upfrontjs.com/).

## Docs
* docs: updated pagination recipe
* docs: corrected pagination example
  * The exists method has taken the `_lastSyncedAt` property into account and here it was not set before
* docs: adjust wording in doc blocks
* docs(services): noted `handleError` is now async
* docs(query-builder): added documentation for `resetQueryParameters`
* docs: fixed grammar mistakes
* docs(factory): updated examples to be in-line with mocks
* docs(api-calls): updated methods to preferred uppercase
* docs: updated recipe to use the new typing
* docs(timestamps): updated attribute name getter method names
    * Linked: 114176ecfec22815fadbbe496e1bcd72fb0762f0
* docs: fixed typo in test name
* docs: updated pagination recipe to handle model constructors
* docs(api-calls): updated to uppercase method names
  * Updated all method argument to `call` to uppercase for consistency
* docs: fixed examples
* docs(api-calls): updated method name to uppercase
  * change missed from 03486f1478b59f13c27ac43edf71ff0e0b25c520

## Perf
* perf(query-builder): simplified withs deduplication

## Feature
* feat(services): made handleError async on ApiResponseHandler
* feat(api-calls): added default type argument
  * While this is invalid, from the outside TS still figures the current `this` correctly
* feat(query-builder): changed `resetQueryParameters` access to public
* feat(api-calls): export `Method` type
* feat(services): widened request type on ApiResponse
* feat(services): added HEAD request handling
* feat(services): improve typings of services call and handle method
* feat(attributes): improved `Attributes` type inference
    * Resolves upfrontjs/framework#154
* feat(attributes): improved `only` method's typing
* feat(attributes): improved `except` typing
* feat(attributes): improved typings on attribute management methods
    * Following have been updated:
      `getOriginal`
      `getRawOriginal`
      `getChanges`
      `getDeletedAttributes`
      `getNewAttributes`
* feat: updated static methods returning models to infer type from `this`
* feat: updated some static inference to not use error ignoring
    * Updates related to: 63ed0bee15b0e65c69845930c152a79e7aa78cb8
* feat(model): added `create` method
    * This allows to constructing a model more fluently

## Fix
* fix(model): updated missed distinctBy in the clone method
* fix(attributes): fixed casting methods typing to accept mixed values
* fix(api-calls): pass the response attributes to the constructor
  * This also cleans up the code a little
* fix(services): normalised fetch methods
  * `patch` could failed with lowercase method name
* fix(api-calls): updated typing to be inclusive of each other on `get`
* fix(relations): fixed `addRelation` typing to accept subclass of a model
* fix: fixed outstanding eslint and typing errors
* fix(model-collection): fixed wrong typing of `toJSON`
    * Issue introduced in b4d6db429f451107419d4bb48c95d2b165036b2e
* fix(**BREAKING CHANGE**): renamed timestamp name methods
  * Renamed the following:
    `getDeletedAtColumn` -> `getDeletedAtName`
    `getCreatedAtColumn` -> `getCreatedAtName`
    `getUpdatedAtColumn` -> `getUpdatedAtName`

## Test
* test(timestamps): tested `restore` accepting server deletedAt value
* test: added initial baseEndpoint in testing
* test(services): added missing test updates
    * Updates missed from a07b22afa4b8c56d74b8c6441e77062636223822
* test(attributes): fixed failing guarding tests
* test(services): added missing test updates
    * Updates missed from a07b22afa4b8c56d74b8c6441e77062636223822
* test(relations): updated testing to use the new typings
* test(model): updated to use new typings
* test(api-calls): added missing data unwrap test
* test(api-calls): added missing endpoint getter test

## Refactor
* refactor(services): simplified `handleError` in response handler
* refactor(attributes): simplified `getAttribute` override typing
* refactor(factory): update return types of mock factories
* refactor(model-collection): updated `toJSON` typing
  * updated `toJSON` typing to track the model's `toJSON`

## Chore
* chore: incremented package version
* chore: added new eslint rule
* chore: moved todos into github
* chore(deps): updated non-breaking dependencies
  * @commitlint/prompt-cli
  * @types/uuid
  * @typescript-eslint/eslint-plugin
  * @typescript-eslint/parser
  * commitlint
  * eslint
  * eslint-plugin-jest
  * lint-staged
  * qs
  * rollup
  * typedoc
  * typescript
* chore(deps-dev): updated breaking change dependencies
  * semantic-release

## Style
* style: fixed eslint issues

## Continuous Integration
* ci: added matrix values explanation
