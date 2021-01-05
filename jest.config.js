module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    rootDir: './',
    transform: {
        "^.+\\.[t]sx?$": "ts-jest"
    },
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts',
        '!<rootDir>/src/index.ts'
    ],
    cacheDirectory: "<rootDir>/tests/cache",
    coverageDirectory: "<rootDir>/tests/coverage",
    coverageProvider: "babel",
    coverageReporters: ["json", "text-summary"],
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
