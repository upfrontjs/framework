# Contributing

Hi there! I'm thrilled that you'd like to contribute to this project. Your help is essential for keeping it great.

## Issues and PRs

If you have suggestions for how this project could be improved, or want to report a bug, open an issue! I'd love all and any contributions. If you have questions, I'd love to hear them, that might just mean that the documentation is lacking.

I'd also love PRs. If you're thinking of a large PR, I advise opening up an issue first to talk about it, though! Look at the links below if you're not sure how to open a PR.

## Which branch

**All** bug fixes should be sent to the latest stable branch. Bug fixes should never be sent to the main branch unless they fix features that exist only in the upcoming release.

**Minor** features that are fully backward compatible with the current release may be sent to the latest stable branch.

**Major** new features should always be sent to the main branch, which contains the upcoming release.

## Submitting a pull request

1. Fork and clone the repository.
2. Run `npm ci`.
5. Create a new branch: `git checkout -b my-branch-name`.
6. Make your change, add tests, and make sure the tests still pass.
7. [Commit](#commit-message-formats) and push to your fork and submit a pull request to the [relevant branch](#which-branch).
8. Pat your self on the back and wait for your pull request to be reviewed and merged.

Here are a few things you can do that will increase the likelihood of your pull request being accepted:

- Follow the style standards which is included in the project. Any linting errors should be shown when running `npm run lint`.
- Write and update tests.
- Keep your changes as focused as possible. If there are multiple changes you would like to make that are not dependent upon each other, consider submitting them as separate pull requests.
- Write a [good commit message](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).
- Update the documentation if applicable.

Work in Progress pull requests are also welcome to get feedback early on, or if there is something blocking you.

## Commit Message Formats

Commit messages are integral to navigating version control, be it by a human or automated tool. To attempt to standardise the messages please follow the below guidance on formatting your commit messages:
 - `feat: ` - commit for a feature pull request e.g.:
```git
    feat: Add isEmpty method to the Collection class
    
    Added isEmpty method as previously discussed on
    https://github.com/....
```
 - `fix: ` - commit for bug fixing pull request e.g.:
```git
    fix: Fixed the invalid query response handling logic
    
    Updated handler to correctly parse response and
    added graceful error handling
    Resolves upfrontjs/framework#99, upfrontjs/framework#100
```
- `chore: ` - commit for code maintenance pull request e.g.:
```git
    chore: Updated dependencies
```
 - `wip: ` - commit for a work-in-progress branch e.g.:
```git
    wip: Started building the GraphQL driver
    
    - Added response parsing support
    - Added request compiling service
```
 - `docs: ` - commit for a branch updating the documentation e.g.:
```git
    docs: Clarified testing helper's description
```

If your commit is related to a discussion/issue on github, please [link to it](https://docs.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword) in your commit message.


More guidance on commit messages can be found at the [resources](#resources) section.

## Documentation

This documentation is kept alongside the source code to keep it in sync with the code it belongs to, and to allow for updating the docs in one go with code changes.

To update the docs in the context of this documentation site I advise you pull down the [upfront docs repo](https://github.com/upfrontjs/docs) and create a symbolic link between framework the the docs e.g.:
```shell
ln -sf /absolute/path/to/upfrontjs/framework/docs/* /absolute/path/to/upfrontjs/docs/
```

## Resources

- [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
- [TypeScript coding guidelines](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines)
- [Using Pull Requests](https://help.github.com/articles/about-pull-requests/)
- [Commit message best practices](https://gist.github.com/robertpainsi/b632364184e70900af4ab688decf6f53)
- [GitHub Help](https://help.github.com)


## Appendices

#### Setup script

 This script will set up the following:

 `pre-commit` git hook:
    - ensure that the code passes linting

 `commit-msg` git hook:
    - ensure the commit message adheres to the [commit message formats](#commit-message-formats)
