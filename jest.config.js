module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    rootDir: './',
    transform: {
        "^.+\\.[t]sx?$": "ts-jest",
        "^.+\\.[j]sx?$": "babel-jest",
    },
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts',
        '!<rootDir>/src/index.ts',
        '!<rootDir>/src/Services/*.ts'
    ],
    coverageDirectory: "<rootDir>/tests/coverage",
    coverageProvider: "babel",
    coverageReporters: ["json", "text"],
    testMatch: [
        "<rootDir>tests/**/*(*.)@(test).[tj]s?(x)"
    ],
    automock: false,
    unmockedModulePathPatterns: [
        "<rootDir>/node_modules/"
    ],
    setupFilesAfterEnv: ["<rootDir>tests/setupTests.ts"],
    errorOnDeprecated: true,
    testPathIgnorePatterns: [
        '/node_modules/'
    ],
    bail: true,
    notify: true,
    notifyMode: 'failure-change',
    globals: {
        window: {}
    },
    extraGlobals: [
        "Function",
        "Array",
        "String",
        "Math"
    ]
};
// todo - figure out dependencies (lodash, pluralize, uuid) - likely to delivery with the package
// todo - what about file uploads? (request customisation can set it to form/multipart-data
// todo - update private modifiers to # where it makes sense
// todo - review circular dependency fix (require() within the function)
// todo - improve typings (eg.: collection pluck K extends keyof T, better user guards)
// todo - will need a cookbook to show the cool shit one might not think of straight away
// https://github.com/marchaos/jest-mock-extended
// https://github.com/hustcc/jest-date-mock

// https://github.com/capricorn86/happy-dom
