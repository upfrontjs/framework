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
    bail: false,
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

// todo - review these:
//  - https://github.com/marchaos/jest-mock-extended
//  - https://github.com/capricorn86/happy-dom
