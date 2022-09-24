/**
 * Ensure the string starts with the given string.
 *
 * @param {string} str
 * @param {string} token.
 *
 * @return {string}
 */
export default function start(str: string, token: string): string {
    return str.startsWith(token) ? str : token + str;
}
