import type { MaybeArray } from '../type';

/**
 * Utility to safely access values on a deeply nested structure.
 * If path doesn't exist, return `undefined`.
 *
 * @param {array|object} data - the structure to search.
 * @param {string} key - the path to the value delimited by `'.'`
 *
 * @example
 * const literal = dataGet([{key:{prop:1}}], '0.key.prop') // === 1;
 */
export default function dataGet<T>(data: MaybeArray<Record<string, any>>, key: string): T | undefined {
    const keys = key.split('.');
    let value = data;

    for (let i = 0; i < keys.length; i++) {
        if (value === undefined) {
            continue;
        }

        value = value[keys[i] as keyof typeof data];
    }

    return value as T;
}
