import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import vitest from "@vitest/eslint-plugin";
import stylistic from "@stylistic/eslint-plugin";
import {defineConfig} from "eslint/config";

export default defineConfig([
    {
        ignores: [
            'node_modules/**',
            '*.js',
            '/types/**',
            'docs/.vuepress/links.ts'
        ]
    },
    // Base JavaScript configuration
    {
        files: ["**/*.{js,mjs,cjs}"],
        ...js.configs.recommended,
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2020,
            },
        },
    },
    // TypeScript configuration with all rules
    {
        files: ["**/*.{ts,mts,cts}"],
        plugins: {
            "@typescript-eslint": tseslint.plugin,
            "@stylistic": stylistic,
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
            globals: {
                ...globals.browser,
                ...globals.es2020,
            },
        },
        rules: {
            // Base ESLint recommended rules
            ...js.configs.recommended.rules,

            // TypeScript ESLint all rules
            ...tseslint.configs.all.find(config => config.rules)?.rules || {},

            // TypeScript ESLint stylistic type-checked rules
            ...tseslint.configs.stylisticTypeChecked.find(config => config.rules)?.rules || {},

            // https://eslint.org/docs/rules/
            "no-any": "off",
            "no-prototype-builtins": "off",
            "no-unused-vars": "off",
            "prefer-rest-params": "warn",
            "semi": "off",
            "no-extra-parens": "off",
            "quotes": "off",
            "func-call-spacing": "off",
            "comma-spacing": "off",
            "keyword-spacing": "off",
            "object-curly-spacing": ["warn", "always"],
            "indent": "off",
            "comma-dangle": ["warn", "never"],
            "max-len": ["warn", 120],
            "eqeqeq": "error",
            "no-restricted-imports": "off",
            "lines-between-class-members": "off",
            "lines-around-comment": "off",

            // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules
            '@stylistic/object-curly-spacing': ['warn', 'always'],
            "@stylistic/indent": ["warn", 4],
            "@stylistic/quotes": ["warn", "single"],
            "@stylistic/semi": "error",
            "@stylistic/no-extra-parens": "error",
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-useless-constructor": "warn",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/explicit-module-boundary-types": ["error", {"allowArgumentsExplicitlyTypedAsAny": true}],
            "@typescript-eslint/prefer-nullish-coalescing": "warn",
            "@typescript-eslint/prefer-optional-chain": "warn",
            "@typescript-eslint/prefer-ts-expect-error": "warn",
            "@typescript-eslint/promise-function-async": "error",
            "@stylistic/function-call-spacing": ["error", "never"],
            "@stylistic/comma-spacing": "warn",
            "@stylistic/keyword-spacing": "warn",
            "@typescript-eslint/consistent-indexed-object-style": ["error", "record"],
            "@typescript-eslint/consistent-type-imports": ["error", {prefer: 'type-imports'}],
            "@stylistic/member-delimiter-style": "warn",
            "@stylistic/type-annotation-spacing": "warn",
            "@typescript-eslint/naming-convention": "error",
            "@typescript-eslint/no-magic-numbers": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/member-ordering": "off",
            "@typescript-eslint/class-literal-property-style": "off",
            "@stylistic/space-before-function-paren": ["warn", {
                "anonymous": "always",
                "named": "never",
                "asyncArrow": "always"
            }],
            "@typescript-eslint/prefer-readonly-parameter-types": "off",
            "@typescript-eslint/init-declarations": "off",
            "@typescript-eslint/no-unnecessary-condition": "off",
            "@typescript-eslint/no-type-alias": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/consistent-type-definitions": "off",
            "@typescript-eslint/strict-boolean-expressions": "off",
            "@typescript-eslint/no-dynamic-delete": "off",
            "@typescript-eslint/no-loop-func": "off",
            "@typescript-eslint/no-confusing-void-expression": "off",
            "@typescript-eslint/array-type": "warn",
            "@typescript-eslint/prefer-for-of": "off",
            "@typescript-eslint/no-restricted-imports": "off",
            "@stylistic/lines-between-class-members": ["error"],
            "@typescript-eslint/max-params": ["warn", {
                "max": 5
            }],
            "@stylistic/lines-around-comment": ["warn", {
                "allowInterfaceStart": true,
                "allowBlockStart": true,
                "allowModuleStart": true,
                "allowTypeStart": true,
                "allowObjectStart": true,
                "allowClassStart": true,
            }],
            "@typescript-eslint/class-methods-use-this": "off",
        },
    },
    {
        files: ["tests/**/*.{js,mjs,cjs,ts,mts,cts}"],
        plugins: {
            "@typescript-eslint": tseslint.plugin,
            "@vitest": vitest,
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
            globals: {
                ...globals.browser,
                ...globals.es2020,
            },
        },
        rules: {
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",

            // Uncomment and configure these Jest/Vitest rules as needed:
            // "vitest/prefer-expect-assertions": "off",
            // "vitest/no-hooks": "off",
            // "vitest/prefer-called-with": "off",
            // "vitest/valid-title": ["error", {
            //     mustMatch: {
            //         it: '^should '
            //     }
            // }],
            // "vitest/no-restricted-matchers": [
            //     "error",
            //     {
            //         "toBeFalsy": 'Use toBe(false) instead to avoid unexpected type coercion.',
            //         "toBeTruthy": 'Use toBe(true) instead to avoid unexpected type coercion.',
            //     }
            // ],
            // "vitest/prefer-lowercase-title": [
            //     "error",
            //     {
            //         "ignore": ["describe"]
            //     }
            // ],
            // "vitest/max-expects": "off"
        },
    },
]);
