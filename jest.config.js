/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    rootDir: './',
    transform: {
        '^.+\\.[t]sx?$': 'ts-jest'
    },
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts',
        '!<rootDir>/src/index.ts'
    ],
    cacheDirectory: '<rootDir>/tests/cache',
    coverageDirectory: '<rootDir>/tests/coverage',
    coverageProvider: 'babel',
    coverageReporters: ['json', 'text'],
    testMatch: [
        '<rootDir>tests/**/*(*.)@(test).[tj]s?(x)'
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
    errorOnDeprecated: true,
    bail: true,
    notify: true,
    notifyMode: 'failure-change',
    globals: {
        window: {},
        global: {}
    },
    extraGlobals: [
        'Function',
        'Array',
        'String',
        'Math',
        'Date'
    ]
};
