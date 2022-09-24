import pluralize from 'pluralize';

/**
 * Get the plural form of the string using the [pluralize](https://www.npmjs.com/package/pluralize) package.
 *
 * @param {string} str
 *
 * @return {string}
 */
export default function plural(str: string): string {
    return pluralize.plural(str);
}
