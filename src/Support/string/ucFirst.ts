/**
 * Uppercase the first letter.
 *
 * @param {string} str
 *
 * @return {string}
 */
export default function ucFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
