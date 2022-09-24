/**
 * Determine whether the given value is a user defined class that can be called with the "new" keyword.
 *
 * @param {any} value
 *
 * @return {boolean}
 */
export default function isUserLandClass<T extends new (...args: any) => any>(value: any): value is T {
    return value instanceof Function && /^\s*class\s+/.test(String(value));
}
