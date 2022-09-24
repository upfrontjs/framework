/**
 * Get part of the string after the given token.
 *
 * @param {string} str
 * @param {string} token - The string to search for.
 *
 * @return {string}
 */
export default function after(str: string, token: string): string {
    if (token === '') return '';

    return str.includes(token) ? str.substring(str.indexOf(token) + token.length, str.length) : '';
}