/**
 * Get the string before the last instance of the found token.
 *
 * @param {string} str
 * @param {string} token - The string to search for.
 *
 * @return {string}
 */
export default function beforeLast(str: string, token: string): string {
    if (token === '') return '';

    return str.includes(token) ? str.substring(0, str.lastIndexOf(token)) : '';
}
