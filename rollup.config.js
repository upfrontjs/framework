import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';
import terser from '@rollup/plugin-terser';
import bundleSize from 'rollup-plugin-bundle-size';

const banner = `
/*! ================================
${pkg.name} v${pkg.version}
(c) 2020-present ${pkg.author}
Released under ${pkg.license} License
================================== */
`;

/**
 * @type {import('rollup/dist/rollup').InputOptions}
 */
const commonConfig = {
    external: [
        ...Object.keys(pkg.dependencies ?? {}),
        ...Object.keys(pkg.optionalDependencies ?? {}),
        ...Object.keys(pkg.peerDependencies ?? {})
    ],
    plugins: [
        // it doesn't find the config by default and doesn't emit interface files
        // todo - https://github.com/rollup/plugins/pull/791/files#diff-77ceb76f06466d761730b952567396e6b5c292cc4044441cdfdf048b4614881dR83 check those tests
        typescript({ tsconfig: './tsconfig.json' }),
        terser({
            format: {
                comments: (node, comment) => {
                    if (comment.type === "comment2") {
                        return /@upfront/.test(comment.value);
                    }
                }
            }
        }),
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
                sourcemap: true,
                banner
            },
            {
                file: pkg.module,
                format: 'es',
                sourcemap: true,
                banner
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
                sourcemap: true,
                banner
            },
            {
                file: 'array.es.min.js',
                format: 'es',
                sourcemap: true,
                banner
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
                sourcemap: true,
                banner
            },
            {
                file: 'string.es.min.js',
                format: 'es',
                sourcemap: true,
                banner
            }
        ],
        ...commonConfig
    }
];

export default rollupConfig;
