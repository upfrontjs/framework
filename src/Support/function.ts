/**
 * Determine whether the given value is a non-null object not including the array type.
 *
 * @param {any} value
 *
 * @return {boolean}
 */
export function isObjectLiteral<T extends Record<any, any>>(value: any): value is NonNullable<T> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Determine whether the given value is a user defined class that can be called with the "new" keyword.
 *
 * @param {any} value
 *
 * @return {boolean}
 */
export function isConstructableUserClass<T extends new (...args: any) => any>(value: any): value is T {
    return value instanceof Function && /^\s*class\s+/.test(String(value));
}
