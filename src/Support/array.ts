/**
 * Ensure the given value is an array.
 *
 * @param {any} value
 *
 * @return {array};
 */
export function wrap<T>(value?: T | T[]): T[] {
    if (!value && typeof value !== 'boolean') {
        value = [];
    }

    if (!Array.isArray(value)) {
        value = [value];
    }

    return value;
}
