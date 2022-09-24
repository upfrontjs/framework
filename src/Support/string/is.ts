/**
 * Check whether the string matches the given string.
 *
 * @param {string} str
 * @param {string|RegExp} compareValue - The Regexp or the string to test for. "*" functions as a wildcard.
 * @param {string} ignoreCase - Flag indicating whether the casing should be ignored or not.
 *
 * @return {boolean}
 */
export default function is(str: string, compareValue: RegExp | string, ignoreCase = false): boolean {
    if (typeof compareValue === 'string') {
        compareValue = new RegExp(
            compareValue.replace(/\*/g, '.*'),
            ignoreCase ? 'i' : ''
        );
    }

    const match = compareValue.exec(str);

    return !!match && !!match.length && match[0] === str;
}
