type Before<
    S extends string,
    ST extends string
> = S extends `${infer P1}${ST}${string}` ? P1 : S extends `${string}${ST}` ? '' : S;

/**
 * Get the string up to and not including the given token.
 *
 * @param {string} str
 * @param {string} token - The string to search for.
 *
 * @return  {string}
 */
export default function before<T extends string, ST extends string>(str: T, token: ST): Before<T, ST>  {
    if (token === '') return '' as Before<T, ST>;

    return (str.includes(token) ? str.substring(0, str.indexOf(token)) : '') as Before<T, ST>;
}
