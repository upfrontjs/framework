/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import pluralize from 'pluralize';

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
        plural(): string;
        singular(): string;
        before(token: string): string;
        beforeLast(token: string): string;
        after(token: string): string;
        afterLast(token: string): string;
        pascal(): string;
        limit(count: number, limiter?: string): string;
        words(count: number, limiter?: string): string;
        is(compareValue: string | RegExp): boolean;
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
            const regex = RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/, 'i');

            return !!regex.exec(this);
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
            return this.substring(0, this.indexOf(token));
        }
    });
}

if (!('beforeLast' in String.prototype)) {
    Object.defineProperty(String.prototype, 'beforeLast', {
        value: function (token: string): string {
            return this.substring(0, this.lastIndexOf(token));
        }
    });
}

if (!('after' in String.prototype)) {
    Object.defineProperty(String.prototype, 'after', {
        value: function (token: string): string {
            return this.substring(this.indexOf(token), this.length);
        }
    });
}


if (!('afterLast' in String.prototype)) {
    Object.defineProperty(String.prototype, 'afterLast', {
        value: function (token: string): string {
            return this.substring(this.lastIndexOf(token), this.length);
        }
    });
}

if (!('pascal' in String.prototype)) {
    Object.defineProperty(String.prototype, 'pascal', {
        value: function (): string {
            return this.ucFirst().split(/[_ -]/g).reduce((previous: string, next: string) => previous + next.ucFirst());
        }
    });
}

if (!('title' in String.prototype)) {
    Object.defineProperty(String.prototype, 'title', {
        value: function (): string {
            return this.ucFirst().split(/[_ -]/g)
                .reduce((previous: string, next: string) => previous + ' ' + next.ucFirst());
        }
    });
}
// todo - update to lodash methods
if (!('snake' in String.prototype)) {
    Object.defineProperty(String.prototype, 'snake', {
        value: function (): string {
            const string = this.replace(/[ -]/g, '_');
            const matches = string.match(/[A-Z][a-z]+/g);

            return matches ? matches.map((string: string) => string.toLowerCase()).join('_') : string;
        }
    });
}

if (!('camel' in String.prototype)) {
    Object.defineProperty(String.prototype, 'camel', {
        value: function (): string {
            return this.replace(/(?:^\w|[A-Z]|\b\w)/g, (word: string, index: number) => {
                return index === 0 ? word.toLowerCase() : word.toUpperCase();
            })
                .replace(/\s+/g, '');
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
        value: function (compareValue: string | RegExp): boolean {
            return !!this.matchAll(compareValue).length;
        }
    });
}

/* Yet to implement: */
//includesAll
//kebab
