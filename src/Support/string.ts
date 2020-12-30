/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import pluralize from 'pluralize';
import * as uuid from 'uuid';
import { snakeCase } from 'lodash';

export {}; // this file needs to be a module

declare global {
    interface String {
        ucFirst(): string;
        isUuid(): boolean;
        title(): string;
        finish(token: string): string;
        start(token: string): string;
        camel(): string;
        snake(): string;
        kebab(): string;
        plural(): string;
        singular(): string;
        before(token: string): string;
        beforeLast(token: string): string;
        after(token: string): string;
        afterLast(token: string): string;
        pascal(): string;
        limit(count: number, limiter?: string): string;
        words(count: number, limiter?: string): string;
        is(compareValue: string | RegExp, ignoreCase?: boolean): boolean;
        includesAll(tokens: string[]): boolean;
    }

    interface StringConstructor {
        uuid(): string;
    }
}

if (!('ucFirst' in String.prototype)) {
    Object.defineProperty(String.prototype, 'ucFirst', {
        value: function (): string {
            return this.charAt(0).toUpperCase() + this.slice(1);
        }
    });
}

if (!('isUuid' in String.prototype)) {
    Object.defineProperty(String.prototype, 'isUuid', {
        value: function (): boolean {
            return uuid.validate(this);
        }
    });
}

if (!('uuid' in String)) {
    Object.defineProperty(String, 'uuid', {
        value: function (): string {
            return uuid.v4();
        }
    });
}

if (!('finish' in String.prototype)) {
    Object.defineProperty(String.prototype, 'finish', {
        value: function (token: string): string {
            return this.endsWith(token) ? this : this + token;
        }
    });
}

if (!('start' in String.prototype)) {
    Object.defineProperty(String.prototype, 'start', {
        value: function (token: string): string {
            return this.startsWith(token) ? this : token + this;
        }
    });
}

if (!('before' in String.prototype)) {
    Object.defineProperty(String.prototype, 'before', {
        value: function (token: string): string {
            return this.indexOf(token) !== -1 ? this.substring(0, this.indexOf(token)) : this;
        }
    });
}

if (!('beforeLast' in String.prototype)) {
    Object.defineProperty(String.prototype, 'beforeLast', {
        value: function (token: string): string {
            return this.lastIndexOf(token) !== -1 ? this.substring(0, this.lastIndexOf(token)) : this;
        }
    });
}

if (!('after' in String.prototype)) {
    Object.defineProperty(String.prototype, 'after', {
        value: function (token: string): string {
            return this.indexOf(token) !== -1
                ? this.substring(this.indexOf(token) + token.length, this.length)
                : this;
        }
    });
}


if (!('afterLast' in String.prototype)) {
    Object.defineProperty(String.prototype, 'afterLast', {
        value: function (token: string): string {
            return this.lastIndexOf(token) !== -1
                ? this.substring(this.lastIndexOf(token) + token.length, this.length)
                : this;
        }
    });
}

if (!('pascal' in String.prototype)) {
    Object.defineProperty(String.prototype, 'pascal', {
        value: function (): string {
            return this.camel().ucFirst();
        }
    });
}

if (!('title' in String.prototype)) {
    Object.defineProperty(String.prototype, 'title', {
        value: function (): string {
            return this.snake().ucFirst().split('_')
                .reduce((previous: string, next: string) => previous + ' ' + next.ucFirst());
        }
    });
}

if (!('snake' in String.prototype)) {
    Object.defineProperty(String.prototype, 'snake', {
        value: function (): string {
            return snakeCase(this);
        }
    });
}

if (!('kebab' in String.prototype)) {
    Object.defineProperty(String.prototype, 'kebab', {
        value: function (): string {
            return this.snake().replace(/_/g, '-');
        }
    });
}

if (!('camel' in String.prototype)) {
    Object.defineProperty(String.prototype, 'camel', {
        value: function (): string {
            const titleCase = this.title().replace(/ /g, '');

            return titleCase.charAt(0).toLowerCase() + titleCase.slice(1);
        }
    });
}

if (!('limit' in String.prototype)) {
    Object.defineProperty(String.prototype, 'limit', {
        value: function (count: number, limiter = '...'): string {
            return this.substring(0, count) + limiter;
        }
    });
}

if (!('words' in String.prototype)) {
    Object.defineProperty(String.prototype, 'words', {
        value: function (count: number, limiter = '...'): string {
            return this.split(' ').slice(0, count).join(' ') + limiter;
        }
    });
}

if (!('plural' in String.prototype)) {
    Object.defineProperty(String.prototype, 'plural', {
        value: function (): string {
            return pluralize.plural(this);
        }
    });
}

if (!('singular' in String.prototype)) {
    Object.defineProperty(String.prototype, 'singular', {
        value: function (): string {
            return pluralize.singular(this);
        }
    });
}

if (!('is' in String.prototype)) {
    Object.defineProperty(String.prototype, 'is', {
        value: function (compareValue: string | RegExp, ignoreCase = false): boolean {
            if (typeof compareValue === 'string') {
                compareValue = new RegExp(
                    compareValue.replace(/\*/g, '.*'),
                    ignoreCase ? 'i' : ''
                );
            }

            const match = this.match(compareValue);

            return !!match && !!match.length && match[0] === this;
        }
    });
}

if (!('includesAll' in String.prototype)) {
    Object.defineProperty(String.prototype, 'includesAll', {
        value: function (tokens: string[]): boolean {
            return tokens.every(token => this.includes(token));
        }
    });
}
