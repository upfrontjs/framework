module.exports = {
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
    }
}
