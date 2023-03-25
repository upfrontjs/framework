/**
 * Uppercase the first letter.
 *
 * @param {string} str
 *
 * @return {string}
 */
export default function ucFirst<T extends string>(str: T): Capitalize<T> {
    return str.charAt(0).toUpperCase() + str.slice(1) as Capitalize<T>;
}
