import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    rootDir: './',
    transform: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
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
    sandboxInjectedGlobals: [
        'Function',
        'Array',
        'String',
        'Math',
        'Date'
    ]
};

export default config;
