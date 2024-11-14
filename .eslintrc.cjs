module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        tsconfigDir: __dirname,
        project: "**/tsconfig.json",
        ecmaVersion: "es2020"
    },
    plugins: [
        "@typescript-eslint",
        "@stylistic/ts"
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/all",
        "plugin:@typescript-eslint/stylistic-type-checked"
    ],
    env: {
        browser: true,
        es2020: true
    },
    ignorePatterns: [
        'node_modules',
        '*.js',
        '/types'
    ],
    rules: {
        // https://eslint.org/docs/rules/
        "no-any": "off",
        "no-prototype-builtins": "off",
        "no-unused-vars": "off",
        "prefer-rest-params": "warn",
        "semi": "off",
        "no-extra-parens": "off",
        "quotes": "off",
        "func-call-spacing": "off",
        "comma-spacing": "off",
        "keyword-spacing": "off",
        "object-curly-spacing": ["warn", "always"],
        "indent": "off",
        "comma-dangle": ["warn", "never"],
        "max-len": ["warn", 120],
        "eqeqeq": "error",
        "no-restricted-imports": "off",
        "lines-between-class-members": "off",
        "lines-around-comment": "off",

        // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules
        '@stylistic/ts/object-curly-spacing': ['warn', 'always'],
        "@stylistic/ts/indent": ["warn", 4],
        "@stylistic/ts/quotes": ["warn", "single"],
        "@stylistic/ts/semi": "error",
        "@stylistic/ts/no-extra-parens": "error",
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/no-useless-constructor": "warn",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/explicit-module-boundary-types": ["error", { "allowArgumentsExplicitlyTypedAsAny": true }],
        "@typescript-eslint/prefer-nullish-coalescing": "warn",
        "@typescript-eslint/prefer-optional-chain": "warn",
        "@typescript-eslint/prefer-ts-expect-error": "warn",
        "@typescript-eslint/promise-function-async": "error",
        "@stylistic/ts/func-call-spacing": ["error", "never"],
        "@stylistic/ts/comma-spacing": "warn",
        "@stylistic/ts/keyword-spacing": "warn",
        "@typescript-eslint/consistent-indexed-object-style": ["error", "record"],
        "@typescript-eslint/consistent-type-imports": ["error", { prefer: 'type-imports' }],
        "@stylistic/ts/member-delimiter-style": "warn",
        "@stylistic/ts/type-annotation-spacing": "warn",
        "@typescript-eslint/naming-convention": "error",
        "@typescript-eslint/no-magic-numbers": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/member-ordering": "off",
        "@typescript-eslint/class-literal-property-style": "off",
        "@stylistic/ts/space-before-function-paren": ["warn", {
            "anonymous": "always",
            "named": "never",
            "asyncArrow": "always"
        }],
        "@typescript-eslint/prefer-readonly-parameter-types": "off",
        "@typescript-eslint/init-declarations": "off",
        "@typescript-eslint/no-unnecessary-condition": "off",
        "@typescript-eslint/no-type-alias": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/consistent-type-definitions": "off",
        "@typescript-eslint/strict-boolean-expressions": "off",
        "@typescript-eslint/no-dynamic-delete": "off",
        "@typescript-eslint/no-loop-func": "off",
        "@typescript-eslint/no-confusing-void-expression": "off",
        "@typescript-eslint/array-type": "warn",
        "@typescript-eslint/prefer-for-of": "off",
        "@typescript-eslint/no-restricted-imports": "off",
        "@stylistic/ts/lines-between-class-members": ["error"],
        "@typescript-eslint/max-params": ["warn", {
            "max": 5
        }],
        "@stylistic/ts/lines-around-comment": ["warn", {
            "allowInterfaceStart": true,
            "allowBlockStart": true,
            "allowModuleStart": true,
            "allowTypeStart": true,
            "allowObjectStart": true,
            "allowClassStart": true,
        }],
        "@typescript-eslint/class-methods-use-this": "off",
    }
}
