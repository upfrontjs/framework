import type { JestConfigWithTsJest } from 'ts-jest';

const commonProjectConfig: Exclude<JestConfigWithTsJest['projects'], undefined>[number] = {
    transform: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '^.+\\.[t]sx?$': 'ts-jest'
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts']
};

const config: JestConfigWithTsJest = {
    preset: 'ts-jest',
    rootDir: './',
    projects: [
        {
            ...commonProjectConfig,
            displayName: 'jsdom',
            testEnvironment: 'jsdom'
        },
        {
            ...commonProjectConfig,
            displayName: 'node',
            testEnvironment: 'node'
        }
    ],
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
