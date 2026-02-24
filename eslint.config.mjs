// @ts-check
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
    {
        ignores: ['eslint.config.mjs'],
    },

    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,

    prettierConfig,

    {
        plugins: {
            prettier: prettierPlugin,
        },
    },

    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            sourceType: 'commonjs',
            parserOptions: {
                project: ['./tsconfig.eslint.json'],
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },

    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-unsafe-argument': 'warn',

            'prettier/prettier': ['error', { endOfLine: 'auto' }],

            '@typescript-eslint/explicit-function-return-type': [
                'warn',
                {
                    allowExpressions: true,
                    allowTypedFunctionExpressions: true,
                    allowHigherOrderFunctions: true,
                },
            ],

            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],

            // Naming convention
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'variable',
                    format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
                },
                {
                    selector: 'function',
                    format: ['camelCase'],
                },
                {
                    selector: 'typeLike',
                    format: ['PascalCase'],
                },
                {
                    selector: 'classProperty',
                    modifiers: ['static', 'readonly'],
                    format: ['UPPER_CASE'],
                },
                {
                    selector: 'classProperty',
                    modifiers: ['readonly'],
                    format: ['camelCase'],
                },
                {
                    selector: 'enumMember',
                    format: ['UPPER_CASE'],
                },
            ],

            // Consistency
            '@typescript-eslint/consistent-type-imports': [
                'error',
                { prefer: 'type-imports' },
            ],
            '@typescript-eslint/no-unnecessary-condition': 'warn',
            '@typescript-eslint/prefer-nullish-coalescing': 'warn',
            '@typescript-eslint/prefer-optional-chain': 'error',
            '@typescript-eslint/no-redundant-type-constituents': 'warn',

            // Promise xatoliklarni oldini olish
            'no-return-await': 'off',
            '@typescript-eslint/return-await': ['error', 'in-try-catch'],

            // Umumiy code quality
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-duplicate-imports': 'error',
            eqeqeq: ['error', 'always'],
            curly: ['error', 'all'],
        },
    },
    {
        files: ['**/*.dto.ts', '**/*.interface.ts', '**/*.types.ts'],
        rules: {
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'classProperty',
                    format: ['camelCase', 'snake_case'],
                },
                {
                    selector: 'objectLiteralProperty',
                    format: null,
                },
                {
                    selector: 'typeProperty',
                    format: ['camelCase', 'snake_case'],
                },
            ],
        },
    },

);