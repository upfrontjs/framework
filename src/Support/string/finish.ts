type Finish<S extends string, ST extends string> = S extends `${string}${ST}` ? S : `${S}${ST}`;

/**
 * Ensure the string ends with the given string.
 *
 * @param {string} str
 * @param {string} token.
 *
 * @return {string}
 */
export default function finish<S extends string, ST extends string>(str: S, token: ST): Finish<S, ST> {
    return (str.endsWith(token) ? str : str + token) as Finish<S, ST>;
}
