import typescript from "@rollup/plugin-typescript";
import pkg from './package.json';
import { terser } from "rollup-plugin-terser";
import bundleSize from 'rollup-plugin-bundle-size';
import copy from 'rollup-plugin-copy'

export default {
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
    external: [
        ...Object.keys(pkg.dependencies)
    ],
    plugins: [
        typescript(),
        terser(),
        bundleSize(),
        copy({
            targets: [
                { src: ['LICENSE.txt', 'docs/README.md'], dest: 'lib' },
            ],
            copyOnce: true
        })
    ]
}
