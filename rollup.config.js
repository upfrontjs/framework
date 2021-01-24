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
        ...Object.keys(pkg.dependencies),
        ...Object.keys(pkg.optionalDependencies)
    ],
    plugins: [
        // it doesn't find the config by default and doesn't emit interface files
        typescript({ tsconfig: './tsconfig.json' }),
        terser(),
        bundleSize()
    ]
};

export default rollupConfig;
