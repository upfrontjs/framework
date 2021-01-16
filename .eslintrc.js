module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        "tsconfigDir": __dirname,
        "project": "./tsconfig.json",
        "debugLevel": true,
        "ecmaVersion": "es2020"
    },
    plugins: [
        "@typescript-eslint",
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
    ],
    env: {
        browser: true,
        es2020: true
    },
    ignorePatterns: [
        'node_modules',
        '.eslintrc.js',
        '*config*.js'
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

        // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules
        "@typescript-eslint/indent": ["warn", 4],
        "@typescript-eslint/quotes": ["warn", "single"],
        "@typescript-eslint/semi": "error",
        "@typescript-eslint/no-extra-parens": "error",
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
        "@typescript-eslint/func-call-spacing": ["error", "never"],
        "@typescript-eslint/comma-spacing": "warn",
        "@typescript-eslint/keyword-spacing": "warn",
        "@typescript-eslint/consistent-indexed-object-style": ["error", "record"],
        "@typescript-eslint/consistent-type-imports": ["error", { prefer: 'type-imports' }],
        "@typescript-eslint/member-delimiter-style": "warn",
        "@typescript-eslint/type-annotation-spacing": "warn",
        "@typescript-eslint/naming-convention": "error"
    }
}
