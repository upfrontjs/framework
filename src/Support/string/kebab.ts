import snake from './snake';

/**
 * Transform the string to kebab-case.
 *
 * @param {string} str
 *
 * @return {string}
 */
export default function kebab(str: string): string {
    return snake(str).replace(/_/g, '-');
}
