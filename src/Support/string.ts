import { validate, v4 } from 'uuid';
import { snakeCase } from 'lodash';
import pluralize from 'pluralize';

/**
 * Uppercase the first letter.
 *
 * @param {string} str
 *
 * @return {string}
 */
export function ucFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Determine whether the given string is a uuid of version 4.
 *
 * @param {string} str
 *
 * @return {string}
 */
export function isUuid(str: unknown): boolean {
    return typeof str === 'string' && validate(str);
}

/**
 * Transform the string to snake_case.
 *
 * @param {string} str
 *
 * @return {string}
 */
export function snake(str: string): string {
    return snakeCase(str);
}

/**
 * Transform the string to Title Case.
 *
 * @param {string} str
 *
 * @return {string}
 */
export function title(str: string): string {
    return ucFirst(snake(str))
        .split('_')
        .reduce((previous: string, next: string) => previous + ' ' + ucFirst(next));
}

/**
 * Ensure the string ends with the given string.
 *
 * @param {string} str
 * @param {string} token.
 *
 * @return {string}
 */
export function finish(str: string, token: string): string {
    return str.endsWith(token) ? str : str + token;
}


/**
 * Ensure the string starts with the given string.
 *
 * @param {string} str
 * @param {string} token.
 *
 * @return {string}
 */
export function start(str: string, token: string): string {
    return str.startsWith(token) ? str : token + str;
}

/**
 * Transform the string to camelCase.
 *
 * @param {string} str
 *
 * @return {string}
 */
export function camel(str: string): string {
    const titleCase = title(str).replace(/ /g, '');

    return titleCase.charAt(0).toLowerCase() + titleCase.slice(1);
}

/**
 * Transform the string to kebab-case.
 *
 * @param {string} str
 *
 * @return {string}
 */
export function kebab(str: string): string {
    return snake(str).replace(/_/g, '-');
}

/**
 * Get the plural form of the string.
 *
 * @param {string} str
 *
 * @return {string}
 */
export function plural(str: string): string {
    return pluralize.plural(str);
}

/**
 * Get the singular form of the string.
 *
 * @param {string} str
 *
 * @return {string}
 */
export function singular(str: string): string {
    return pluralize.singular(str);
}

/**
 * Get the string up to and not including the given token.
 *
 * @param {string} str
 * @param {string} token - The string to search for.
 *
 * @return  {string}
 */
export function before(str: string, token: string): string  {
    if (token === '') return '';

    return str.includes(token) ? str.substring(0, str.indexOf(token)) : '';
}

/**
 * Get the string before the last instance of the found token.
 *
 * @param {string} str
 * @param {string} token - The string to search for.
 *
 * @return {string}
 */
export function beforeLast(str: string, token: string): string {
    if (token === '') return '';

    return str.includes(token) ? str.substring(0, str.lastIndexOf(token)) : '';
}

/**
 * Get part of the string after the given token.
 *
 * @param {string} str
 * @param {string} token - The string to search for.
 *
 * @return {string}
 */
export function after(str: string, token: string): string {
    if (token === '') return '';

    return str.includes(token) ? str.substring(str.indexOf(token) + token.length, str.length) : '';
}

/**
 * Get part of the string after the last found instance of the given token.
 *
 * @param {string} str
 * @param {string} token - The string to search for.
 *
 * @return {string}
 */
export function afterLast(str: string, token: string): string {
    if (token === '') return '';

    return str.includes(token) ? str.substring(str.lastIndexOf(token) + token.length, str.length) : '';
}

/**
 * Transform the string to PascalCase.
 *
 * @param {string} str
 *
 * @return {string}
 */
export function pascal(str: string): string {
    return ucFirst(camel(str));
}

/**
 * Limit the number of characters on the string.
 *
 * @param {string} str
 * @param {number} count - The number of characters to keep.
 * @param {string} limiter - The string to be appended at the end after the limit.
 *
 * @return {string}
 */
export function limit(str: string, count: number, limiter = '...'): string {
    return str.substring(0, count) + limiter;
}

/**
 * Limit the number of words on the string.
 *
 * @param {string} str
 * @param {number} count - The number of words to keep.
 * @param {string} limiter - The string to be appended at the end after the limit.
 *
 * @return {string}
 */
export function words(str: string, count: number, limiter = '...'): string {
    return str.split(' ').slice(0, count).join(' ') + limiter;
}

/**
 * Check whether the string matches the given string.
 *
 * @param {string} str
 * @param {string|RegExp} compareValue - The Regexp or the string to test for. "*" functions as a wildcard.
 * @param {string} ignoreCase - Flag indicating whether the casing should be ignored or not.
 *
 * @return {boolean}
 */
export function is(str: string, compareValue: RegExp | string, ignoreCase = false): boolean {
    if (typeof compareValue === 'string') {
        compareValue = new RegExp(
            compareValue.replace(/\*/g, '.*'),
            ignoreCase ? 'i' : ''
        );
    }

    const match = compareValue.exec(str);

    return !!match && !!match.length && match[0] === str;
}

/**
 * Test whether all the tokens included in the string.
 *
 * @param {string} str
 * @param {string[]} tokens
 *
 * @return {boolean}
 */
export function includesAll(str: string, tokens: string[]): boolean {
    return tokens.every(token => str.includes(token));
}

/**
 * Generate a uuid of version 4.
 *
 * @return {string}
 */
export function uuid(): string {
    return v4();
}
