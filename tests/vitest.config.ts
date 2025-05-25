import { defineConfig } from 'vitest/config';
import { isCI } from 'std-env';

export default defineConfig({
    test: {
        bail: 1,
        reporters: isCI ? ['dot', 'github-actions'] : ['default'],
        setupFiles: ['./tests/setupTests.ts'],
        coverage: {
            reportsDirectory: './tests/coverage'
        }
    }
});
