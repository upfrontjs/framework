import type { MaybeArray } from '../type';

/**
 * Ensure the given value is an array.
 *
 * @param {any} value
 *
 * @return {array};
 */
export default function wrap<T>(value?: MaybeArray<T>): T[] {
    if (!arguments.length) {
        return [];
    }

    if (!Array.isArray(value)) {
        value = [value] as T[];
    }

    return value;
}
