import ucFirst from './ucFirst';
import camel from './camel';

/**
 * Transform the string to PascalCase.
 *
 * @param {string} str
 *
 * @return {string}
 */
export default function pascal(str: string): string {
    return ucFirst(camel(str));
}
