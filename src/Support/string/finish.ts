/**
 * Ensure the string ends with the given string.
 *
 * @param {string} str
 * @param {string} token.
 *
 * @return {string}
 */
export default function finish(str: string, token: string): string {
    return str.endsWith(token) ? str : str + token;
}
