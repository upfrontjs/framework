/**
 * Get the string up to and not including the given token.
 *
 * @param {string} str
 * @param {string} token - The string to search for.
 *
 * @return  {string}
 */
export default function before(str: string, token: string): string  {
    if (token === '') return '';

    return str.includes(token) ? str.substring(0, str.indexOf(token)) : '';
}
