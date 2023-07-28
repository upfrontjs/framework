import snakeCase from 'lodash.snakecase';

/**
 * Transform the string to snake_case.
 *
 * @param {string} str
 *
 * @return {string}
 */
export default function snake(str: string): string {
    return snakeCase(str);
}
