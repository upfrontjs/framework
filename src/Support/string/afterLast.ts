/**
 * Get part of the string after the last found instance of the given token.
 *
 * @param {string} str
 * @param {string} token - The string to search for.
 *
 * @return {string}
 */
export default function afterLast(str: string, token: string): string {
    if (token === '') return '';

    return str.includes(token) ? str.substring(str.lastIndexOf(token) + token.length, str.length) : '';
}
