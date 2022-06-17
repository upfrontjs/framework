import { camel, snake } from './string';

/**
 * Determine whether the given value is a non-null object not including the array type.
 *
 * @param {any} value
 *
 * @return {boolean}
 */
export function isObjectLiteral<T extends Record<PropertyKey, any>>(value: any): value is NonNullable<T> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Determine whether the given value is a user defined class that can be called with the "new" keyword.
 *
 * @param {any} value
 *
 * @return {boolean}
 */
export function isUserLandClass<T extends new (...args: any) => any>(value: any): value is T {
    return value instanceof Function && /^\s*class\s+/.test(String(value));
}

/**
 * Utility to recursively format the keys according to the server argument.
 *
 * @param {object} attributes - The object which should be formatted.
 * @param {'camel' | 'snake'} casing - Whether to use camelCase or snake_case.
 *
 * @return {object}
 */
export function transformKeys<T = Record<string, any>>(attributes: Record<string, any>, casing?: 'camel' | 'snake'): T;
export function transformKeys(
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
                : attributes[key];
    });

    return dataWithKeyCasing;
}
