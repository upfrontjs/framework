import typescript from "@rollup/plugin-typescript";
import pkg from './package.json';
import { terser } from "rollup-plugin-terser";
import bundleSize from 'rollup-plugin-bundle-size';

const commonConfig = {
    external: [
        ...Object.keys(pkg.dependencies ?? {}),
        ...Object.keys(pkg.optionalDependencies ?? {}),
        ...Object.keys(pkg.peerDependencies ?? {})
    ],
    plugins: [
        // it doesn't find the config by default and doesn't emit interface files
        typescript({ tsconfig: './tsconfig.json' }),
        terser(),
        bundleSize()
    ]
};

/**
 * @type {import('rollup/dist/rollup').RollupOptions[]}
 */
const rollupConfig = [
    {
        input: 'src/index.ts',
        output: [
            {
                file: pkg.main,
                format: 'cjs',
                sourcemap: true
            },
            {
                file: pkg.module,
                format: 'es',
                sourcemap: true
            }
        ],
        ...commonConfig
    },

    {
        input: 'src/array.ts',
        output: [
            {
                file: 'array.min.js',
                format: 'cjs',
                sourcemap: true
            },
            {
                file: 'array.es.min.js',
                format: 'es',
                sourcemap: true
            }
        ],
        ...commonConfig
    },

    {
        input: 'src/string.ts',
        output: [
            {
                file: 'string.min.js',
                format: 'cjs',
                sourcemap: true
            },
            {
                file: 'string.es.min.js',
                format: 'es',
                sourcemap: true
            }
        ],
        ...commonConfig
    },
];

export default rollupConfig;
