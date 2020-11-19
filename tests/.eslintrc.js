module.exports = {
    parserOptions: {
        "project": [__dirname + "/tsconfig.json"],
    },
    extends: [
        "plugin:jest/all"
    ],
    env: {
        "jest/globals": true
    },
    plugins: ["jest"],
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
