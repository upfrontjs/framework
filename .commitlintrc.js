/**
 * @type {import('@commitlint/types').UserConfig}
 */
module.exports = {
    extends: ['@commitlint/config-conventional'],

    rules: {
        'scope-enum': [
            2,
            'always',
            [
                'attributes', // guarding and casting can also go under attributes
                'global-config',
                'exception',
                'services',
                'helpers',
                'collection',
                'model-collection',
                'paginator',
                'factory',
                'query-builder',
                'timestamps', // soft-deletes can also go under timestamps
                'relations',
                'api-calls',
                'deps',
                'dev-deps'
            ]
        ],
    }
};
