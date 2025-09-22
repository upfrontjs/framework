import type { MaybeArray, Data } from '../type';
import type Collection from '../Collection';

/**
 * Utility to safely access values on a deeply nested structure.
 * If path doesn't exist, return the default value.
 *
 * @param {array|object=} data - the structure to search.
 * @param {string|string[]} path - the path to the value delimited by `'.'`
 * @param {*} defaultValue - the value to return if the path doesn't exist.
 *
 * @example
 * const result1 = dataGet([{key:{prop:1}}], '0.key.prop') // 1;
 * const result2 = dataGet([{key:{prop:1}}], '*.key.prop') // [1];
 */
export default function dataGet<T>(
    data: Collection<Data> | MaybeArray<Data> | undefined = undefined,
    path: Collection<string> | MaybeArray<string>,
    defaultValue?: T
): T | undefined {
    if (!data) {
        return defaultValue;
    }

    if (typeof path === 'object' && 'toArray' in path && typeof path.toArray === 'function') {
        path = path.toArray();
    }

    const segments = Array.isArray(path) ? path : (path as string).split('.');
    let value = data;

    for (let i = 0; i < segments.length; i++) {
        if (segments[i] === '*') {
            if (typeof value === 'object' && 'toArray' in value && typeof value.toArray === 'function') {
                value = (value as Collection<Data>).toArray();
            }

            if (!Array.isArray(value)) {
                return defaultValue;
            }

            value = value.map((v: Data) => {
                return dataGet(v, segments.slice(i + 1), defaultValue)!;
            });

            const stars = segments.slice(i).filter(k => k === '*').length;

            if (stars > 1) {
                // every star in lower iterations will be flattened
                value = (value as Data[]).flat(stars);
            }

            // skip every star and the next key
            i += stars + 1;

            // if every result is actually the default value, return the default value
            if ((value as Data[]).every(v => String(v) === String(defaultValue))) {
                return defaultValue;
            }

            continue;
        }

        if (!(segments[i]! in value)) {
            i = segments.length;
            return defaultValue;
        }

        value = value[segments[i] as keyof typeof value];
    }

    return value as T;
}
