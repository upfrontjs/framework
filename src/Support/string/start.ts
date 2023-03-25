type Start<T extends string, ST extends string> = T extends `${ST}${string}` ? T : `${ST}${T}`;

/**
 * Ensure the string starts with the given string.
 *
 * @param {string} str
 * @param {string} token.
 *
 * @return {string}
 */
export default function start<T extends string, ST extends string>(str: T, token: ST): Start<T, ST> {
    return (str.startsWith(token) ? str : token + str) as Start<T, ST>;
}
