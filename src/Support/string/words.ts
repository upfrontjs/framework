/**
 * Limit the number of words on the string.
 *
 * @param {string} str
 * @param {number} count - The number of words to keep.
 * @param {string} limiter - The string to be appended at the end after the limit.
 *
 * @return {string}
 */
export default function words(str: string, count: number, limiter = '...'): string {
    return str.split(' ').slice(0, count).join(' ') + limiter;
}
