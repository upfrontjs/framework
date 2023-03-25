type BeforeLast<S extends string, ST extends string> = ST extends ''
    ? ''
    : S extends `${infer P1}${ST}${infer P2}`
        ? P1 extends `${string}${ST}${string}`
            ? BeforeLast<P1, ST>
            : P2 extends `${string}${ST}${string}` ? `${P1}${ST}${BeforeLast<P2, ST>}` : P1
        : S extends `${string}${ST}` ? '' : S;

/**
 * Get the string before the last instance of the found token.
 *
 * @param {string} str
 * @param {string} token - The string to search for.
 *
 * @return {string}
 */
export default function beforeLast<T extends string, ST extends string>(str: T, token: ST): BeforeLast<T, ST> {
    if (token === '') return '' as BeforeLast<T, ST>;

    return (str.includes(token) ? str.substring(0, str.lastIndexOf(token)) : '') as BeforeLast<T, ST>;
}
