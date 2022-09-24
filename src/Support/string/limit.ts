/**
 * Limit the number of characters on the string.
 *
 * @param {string} str
 * @param {number} count - The number of characters to keep.
 * @param {string} limiter - The string to be appended at the end after the limit.
 *
 * @return {string}
 */
export default function limit(str: string, count: number, limiter = '...'): string {
    return str.substring(0, count) + limiter;
}
