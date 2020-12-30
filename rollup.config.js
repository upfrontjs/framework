import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import { terser } from "rollup-plugin-terser";
import bundleSize from 'rollup-plugin-bundle-size';

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
        typescript({
            typescript: require('typescript'),
        }),
        terser(),
        bundleSize()
        // copy license and readme (and interfaces?)
    ]
}
