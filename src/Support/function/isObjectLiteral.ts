/**
 * Determine whether the given value is a non-null object not including the array type.
 *
 * @param {any} value
 *
 * @return {boolean}
 */
export default function isObjectLiteral<T extends Record<PropertyKey, any>>(value: any): value is NonNullable<T> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
