import typescript from "@rollup/plugin-typescript";
import pkg from './package.json';
import { terser } from "rollup-plugin-terser";
import bundleSize from 'rollup-plugin-bundle-size';


/**
 * @type {import('rollup/dist/rollup').RollupOptions}
 */
const rollupConfig = {
    input: 'src/index.ts',
    output: [
        {
            file: pkg.main,
            format: 'iife',
            name: 'Upfront',
            sourcemap: true
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true
        }
    ],
    external: [
        ...Object.keys(pkg.dependencies),
        ...Object.keys(pkg.optionalDependencies)
    ],
    plugins: [
        typescript(),
        terser(),
        bundleSize()
    ]
};

export default rollupConfig;
