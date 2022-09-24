/**
 * Test whether all the tokens included in the string.
 *
 * @param {string} str
 * @param {string[]} tokens
 *
 * @return {boolean}
 */
export default function includesAll(str: string, tokens: string[]): boolean {
    return tokens.every(token => str.includes(token));
}
