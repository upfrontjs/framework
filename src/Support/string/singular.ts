import pluralize from 'pluralize';

/**
 * Get the singular form of the string using the [pluralize](https://www.npmjs.com/package/pluralize) package.
 *
 * @param {string} str
 *
 * @return {string}
 */
export default function singular(str: string): string {
    return pluralize.singular(str);
}
