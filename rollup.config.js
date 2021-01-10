import typescript from "@rollup/plugin-typescript";
import pkg from './package.json';
import * as tsConfig from './tsconfig.json';
import { terser } from "rollup-plugin-terser";
import bundleSize from 'rollup-plugin-bundle-size';
import copy from 'rollup-plugin-copy'

const sourcemapPathTransform = (relativeSourcePath, sourcemapPath) => {
    // fix the relative path which was pointing to the original src,
    // and point to the copied in src folder
    return '.' + relativeSourcePath.slice(tsConfig.compilerOptions.sourceRoot.length)
}

export default {
    input: 'src/index.ts',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            sourcemap: true,
            sourcemapPathTransform
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true,
            sourcemapPathTransform
        }
    ],
    external: [
        ...Object.keys(pkg.dependencies)
    ],
    plugins: [
        typescript(),
        terser(),
        bundleSize(),
        copy({
            targets: [
                { src: ['LICENSE.txt', 'docs/README.md', 'src'], dest: 'lib' },
            ],
            copyOnce: true
        })
    ]
}
