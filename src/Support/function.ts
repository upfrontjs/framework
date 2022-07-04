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
 * @param {'camel' | 'snake'} [casing='camel'] - Whether to use camelCase or snake_case.
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

/**
 * Utility to re-run the given promise function until it resolves
 * or until the number of tries was exceeded.
 *
 * @param fn - The function returning a promise to be called.
 * @param {number} [maxRetries=3] - The number of times the function should be retried.
 * @param {number|function} [timeout=0] - The wait time between attempts in milliseconds.
 *                                        If 0, it will not wait.
 *                                        If a function, it will be called with the number of retries left.
 *
 * @example
 * // try up to four times with 2s delay between each try
 * const model = await retry(Model.find(1), 4, 2000);
 *
 * @return {Promise<any>}
 */
export async function retry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    timeout: number | ((currentAttemptCount: number) => number) = 0
): Promise<T> {
    return new Promise((resolve, reject) => {
        let retries = 0;

        const attempt = () => {
            fn().then(resolve).catch(err => {
                if (retries++ < maxRetries) {
                    if (timeout) {
                        setTimeout(attempt, typeof timeout === 'function' ? timeout(retries) : timeout);
                    } else {
                        attempt();
                    }
                } else {
                    reject(err);
                }
            });
        };

        attempt();
    });
}
