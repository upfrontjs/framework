import typescript from '@rollup/plugin-typescript';
import pkg from './package.json' assert { type: 'json' };
import terser from '@rollup/plugin-terser';
import bundleSize from 'rollup-plugin-output-size';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import * as path from 'node:path';
import type { InputOptions, RollupOptions, SourcemapPathTransformOption } from 'rollup';

const banner = `
/*! ================================
${pkg.name} v${pkg.version}
(c) 2020-present ${pkg.author}
Released under ${pkg.license} License
================================== */
`;

const commonConfig: InputOptions = {
    external: [
        ...Object.keys(pkg.dependencies ?? {}),
        ...Object.keys(pkg.peerDependencies ?? {})
    ],
    plugins: [
        // it doesn't find the config by default and doesn't emit interface files
        // todo - https://github.com/rollup/plugins/pull/791/files#diff-77ceb76f06466d761730b952567396e6b5c292cc4044441cdfdf048b4614881dR83 check those tests
        typescript({ tsconfig: './build.tsconfig.json' }),
        terser({
            format: {
                comments: (_node, comment) => {
                    if (comment.type === 'comment2') {
                        return comment.value.includes('@upfront');
                    }

                    return false;
                }
            }
        }),
        bundleSize()
    ]
};

const sourcemapPathTransform: SourcemapPathTransformOption = relativeSourcePath => {
    return relativeSourcePath.replaceAll('.ts', '.d.ts')
        .replaceAll('src/', 'types/');
};

const rollupConfig: RollupOptions[] = [
    {
        input: 'src/index.ts',
        output: [
            {
                file: pkg.main,
                format: 'cjs',
                sourcemap: true,
                sourcemapPathTransform,
                banner
            },
            {
                file: pkg.module,
                format: 'es',
                sourcemap: true,
                sourcemapPathTransform,
                banner
            }
        ],
        ...commonConfig
    },

    {
        input: Object.fromEntries(
            glob.sync('src/Support/{array,string,function}/*.ts').map(file => [
                // This removes `src/` as well as the file extension from each
                // file, so e.g., src/nested/foo.js becomes nested/foo
                path.relative(
                    'src',
                    file.slice(0, file.length - path.extname(file).length)
                ),
                // This expands the relative paths to absolute paths, so e.g.
                // src/nested/foo becomes /project/src/nested/foo.js
                fileURLToPath(new URL(file, import.meta.url))
            ])
        ),
        output: {
            format: 'es',
            sourcemap: true,
            sourcemapPathTransform,
            dir: './'
        },
        ...commonConfig
    },

    {
        input: 'src/array.ts',
        output: [
            {
                file: 'array.min.cjs',
                format: 'cjs',
                sourcemap: true,
                sourcemapPathTransform,
                banner
            },
            {
                file: 'array.es.min.js',
                format: 'es',
                sourcemap: true,
                sourcemapPathTransform,
                banner
            }
        ],
        ...commonConfig
    },

    {
        input: 'src/string.ts',
        output: [
            {
                file: 'string.min.cjs',
                format: 'cjs',
                sourcemap: true,
                sourcemapPathTransform,
                banner
            },
            {
                file: 'string.es.min.js',
                format: 'es',
                sourcemap: true,
                sourcemapPathTransform,
                banner
            }
        ],
        ...commonConfig
    }
];

export default rollupConfig;
