import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        bail: 1,
        setupFiles: ['./tests/setupTests.ts'],
        coverage: {
            reportsDirectory: './tests/coverage',
        }
    }
});
