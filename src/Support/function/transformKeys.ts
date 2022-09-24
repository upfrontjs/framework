import { camel, snake } from '../string';
import isObjectLiteral from './isObjectLiteral';

/**
 * Utility to recursively format the keys according to the server argument.
 *
 * @param {object} attributes - The object which should be formatted.
 * @param {'camel' | 'snake'} [casing='camel'] - Whether to use camelCase or snake_case.
 *
 * @return {object}
 */
export default function transformKeys<T = Record<string, any>>(
    attributes: Record<string, any>, casing?: 'camel' | 'snake'
): T;
export default function transformKeys(
    attributes: Record<string, any>,
    casing: 'camel' | 'snake' = 'camel'
): Record<string, any> {
    const dataWithKeyCasing: Record<string, any> = {};

    Object.keys(attributes).forEach(key => {
        dataWithKeyCasing[casing === 'camel' ? camel(key) : snake(key)] =
            // If attributes[key] is a model/collection or otherwise a constructible structure
            // it would count as an object literal, so we add a not Object constructor.
            // check. This prevents it from becoming an object literal, and in turn
            // its prototype chain keys turning into the new object's own keys.
            isObjectLiteral(attributes[key]) && (attributes[key] as new() => any).constructor === Object
                ? transformKeys(attributes[key] as Record<string, any>, casing)
                : Array.isArray(attributes[key])
                    ? (attributes[key] as any[]).map(item => {
                        // same check as above
                        return isObjectLiteral(item) && item.constructor === Object
                            ? transformKeys(item, casing)
                            : item;
                    })
                    : attributes[key];
    });

    return dataWithKeyCasing;
}
