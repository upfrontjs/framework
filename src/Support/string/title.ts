import ucFirst from './ucFirst';
import snake from './snake';

/**
 * Transform the string to Title Case.
 *
 * @param {string} str
 *
 * @return {string}
 */
export default function title(str: string): string {
    return ucFirst(snake(str))
        .split('_')
        .reduce((previous: string, next: string) => previous + ' ' + ucFirst(next));
}
