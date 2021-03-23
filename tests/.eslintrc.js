module.exports = {
    parserOptions: {
        "project": "./tsconfig.json",
    },
    extends: [
        "../.eslintrc.js",
        "plugin:jest/all"
    ],
    env: {
        browser: true,
        es2020: true,
        "jest/globals": true
    },
    plugins: [
        "@typescript-eslint",
        "jest"
    ],
    rules: {
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",

        // https://www.npmjs.com/package/eslint-plugin-jest#rules
        "jest/prefer-expect-assertions": "off",
        "jest/no-hooks": "off",
        "jest/prefer-called-with": "off",
        "jest/valid-title": ["error", {
            mustMatch: {
                it: '^should '
            }
        }],
        "jest/no-restricted-matchers": [
            "error",
            {
                "toBeFalsy": 'Use toBe(false) instead to avoid unexpected type coercion.',
                "toBeTruthy": 'Use toBe(true) instead to avoid unexpected type coercion.',
            }
        ],
        "jest/lowercase-name": [
            "error",
            {
                "ignore": ["describe"]
            }
        ]
    }
}
