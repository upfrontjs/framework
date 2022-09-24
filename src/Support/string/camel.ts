import title from './title';

/**
 * Transform the string to camelCase.
 *
 * @param {string} str
 *
 * @return {string}
 */
export default function camel(str: string): string {
    const titleCase = title(str).replace(/ /g, '');

    return titleCase.charAt(0).toLowerCase() + titleCase.slice(1);
}
