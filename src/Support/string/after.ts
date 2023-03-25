type After<
    S extends string,
    ST extends string
> = S extends `${string}${ST}${infer P}` ? P : S extends `${string}${ST}` ? '' : S;

/**
 * Get part of the string after the given token.
 *
 * @param {string} str
 * @param {string} token - The string to search for.
 *
 * @return {string}
 */
export default function after<T extends string, ST extends string>(str: T, token: ST): After<T, ST> {
    if (token === '') return '' as After<T, ST>;

    return (str.includes(token) ? str.substring(str.indexOf(token) + token.length, str.length) : '') as After<T, ST>;
}
