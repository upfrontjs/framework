import * as str from './Support/string';

declare global {
    /**
     * Globally available methods on String.prototype.
     */
    interface String {
        /**
         * Uppercase the first letter.
         */
        ucFirst: () => string;

        /**
         * Determine whether the given string is a UUID of version 4.
         */
        isUuid: () => boolean;

        /**
         * Transform the string to Title Case.
         */
        title: () => string;

        /**
         * Ensure the string ends with the given string.
         *
         * @param {string} token.
         */
        finish: (token: string) => string;

        /**
         * Ensure the string starts with the given string.
         *
         * @param {string} token.
         */
        start: (token: string) => string;

        /**
         * Transform the string to camelCase.
         */
        camel: () => string;

        /**
         * Transform the string to snake_case.
         */
        snake: () => string;

        /**
         * Transform the string to kebab-case.
         */
        kebab: () => string;

        /**
         * Get the plural form of the string using the [pluralize](https://www.npmjs.com/package/pluralize) package.
         */
        plural: () => string;

        /**
         * Get the singular form of the string using the [pluralize](https://www.npmjs.com/package/pluralize) package.
         */
        singular: () => string;

        /**
         * Get the string up to and not including the given token.
         *
         * @param {string} token - The string to search for.
         */
        before: (token: string) => string;

        /**
         * Get the string before the last instance of the found token.
         *
         * @param {string} token - The string to search for.
         */
        beforeLast: (token: string) => string;

        /**
         * Get part of the string after the given token.
         *
         * @param {string} token - The string to search for.
         */
        after: (token: string) => string;

        /**
         * Get part of the string after the last found instance of the given token.
         *
         * @param {string} token - The string to search for.
         */
        afterLast: (token: string) => string;

        /**
         * Transform the string to PascalCase.
         */
        pascal: () => string;

        /**
         * Limit the number of characters on the string.
         *
         * @param {number} count - The number of characters to keep.
         * @param {string} limiter - The string to be appended at the end after the limit.
         */
        limit: (count: number, limiter?: string) => string;

        /**
         * Limit the number of words on the string.
         *
         * @param {number} count - The number of words to keep.
         * @param {string} limiter - The string to be appended at the end after the limit.
         */
        words: (count: number, limiter?: string) => string;

        /**
         * Check whether the string matches the given string.
         *
         * @param {string|RegExp} compareValue - The Regexp or the string to test for. "*" functions as a wildcard.
         * @param {string} ignoreCase - Flag indicating whether the casing should be ignored or not.
         */
        is: (compareValue: RegExp | string, ignoreCase?: boolean) => boolean;

        /**
         * Test whether all the tokens included in the string.
         *
         * @param {string[]} tokens
         */
        includesAll: (tokens: string[]) => boolean;
    }

    /**
     * Globally available methods on String.
     */
    interface StringConstructor {
        /**
         * Generate a uuid of version 4 using the [uuid](https://www.npmjs.com/package/uuid) package.
         */
        uuid: () => string;

        /**
         * Determine whether the given string is a UUID of version 4.
         */
        isUuid: (str: string) => boolean;
    }
}

if (!('ucFirst' in String.prototype)) {
    Object.defineProperty(String.prototype, 'ucFirst', {
        value: function (): string {
            return str.ucFirst(this as string);
        }
    });
}

if (!('isUuid' in String.prototype)) {
    Object.defineProperty(String.prototype, 'isUuid', {
        value: function (): boolean {
            return str.isUuid(this as string);
        }
    });
}

if (!('isUuid' in String)) {
    Object.defineProperty(String, 'isUuid', {
        value: function (value: string): boolean {
            return str.isUuid(value);
        }
    });
}

if (!('uuid' in String)) {
    Object.defineProperty(String, 'uuid', {
        value: function (): string {
            return str.uuid();
        }
    });
}

if (!('finish' in String.prototype)) {
    Object.defineProperty(String.prototype, 'finish', {
        value: function (token: string): string {
            return str.finish(this as string, token);
        }
    });
}

if (!('start' in String.prototype)) {
    Object.defineProperty(String.prototype, 'start', {
        value: function (token: string): string {
            return str.start(this as string, token);
        }
    });
}

if (!('before' in String.prototype)) {
    Object.defineProperty(String.prototype, 'before', {
        value: function (token: string): string {
            return str.before(this as string, token);
        }
    });
}

if (!('beforeLast' in String.prototype)) {
    Object.defineProperty(String.prototype, 'beforeLast', {
        value: function (token: string): string {
            return str.beforeLast(this as string, token);
        }
    });
}

if (!('after' in String.prototype)) {
    Object.defineProperty(String.prototype, 'after', {
        value: function (token: string): string {
            return str.after(this as string, token);
        }
    });
}


if (!('afterLast' in String.prototype)) {
    Object.defineProperty(String.prototype, 'afterLast', {
        value: function (token: string): string {
            return str.afterLast(this as string, token);
        }
    });
}

if (!('pascal' in String.prototype)) {
    Object.defineProperty(String.prototype, 'pascal', {
        value: function (): string {
            return str.pascal(this as string);
        }
    });
}

if (!('title' in String.prototype)) {
    Object.defineProperty(String.prototype, 'title', {
        value: function (): string {
            return str.title(this as string);
        }
    });
}

if (!('snake' in String.prototype)) {
    Object.defineProperty(String.prototype, 'snake', {
        value: function (): string {
            return str.snake(this as string);
        }
    });
}

if (!('kebab' in String.prototype)) {
    Object.defineProperty(String.prototype, 'kebab', {
        value: function (): string {
            return str.kebab(this as string);
        }
    });
}

if (!('camel' in String.prototype)) {
    Object.defineProperty(String.prototype, 'camel', {
        value: function (): string {
            return str.camel(this as string);
        }
    });
}

if (!('limit' in String.prototype)) {
    Object.defineProperty(String.prototype, 'limit', {
        value: function (count: number, limiter = '...'): string {
            return str.limit(this as string, count, limiter);
        }
    });
}

if (!('words' in String.prototype)) {
    Object.defineProperty(String.prototype, 'words', {
        value: function (count: number, limiter = '...'): string {
            return str.words(this as string, count, limiter);
        }
    });
}

if (!('plural' in String.prototype)) {
    Object.defineProperty(String.prototype, 'plural', {
        value: function (): string {
            return str.plural(this as string);
        }
    });
}

if (!('singular' in String.prototype)) {
    Object.defineProperty(String.prototype, 'singular', {
        value: function (): string {
            return str.singular(this as string);
        }
    });
}

if (!('is' in String.prototype)) {
    Object.defineProperty(String.prototype, 'is', {
        value: function (compareValue: RegExp | string, ignoreCase = false): boolean {
            return str.is(this as string, compareValue, ignoreCase);
        }
    });
}

if (!('includesAll' in String.prototype)) {
    Object.defineProperty(String.prototype, 'includesAll', {
        value: function (tokens: string[]): boolean {
            return str.includesAll(this as string, tokens);
        }
    });
}
