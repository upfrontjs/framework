type AfterLast<
    S extends string,
    ST extends string
> = S extends `${string}${ST}${infer P1}`
    ? P1 extends `${string}${ST}${string}` ? AfterLast<P1, ST> : P1
    : S extends `${string}${ST}` ? '' : S;

/**
 * Get part of the string after the last found instance of the given token.
 *
 * @param {string} str
 * @param {string} token - The string to search for.
 *
 * @return {string}
 */
export default function afterLast<T extends string, ST extends string>(str: T, token: ST): AfterLast<T, ST> {
    if (token === '') return '' as AfterLast<T, ST>;

    return (str.includes(token)
        ? str.substring(str.lastIndexOf(token) + token.length, str.length)
        : '') as AfterLast<T, ST>;
}
