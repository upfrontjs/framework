import type { MaybeArray } from '../type';
import Collection from '../Collection';

type Data = Record<string, any>;

/**
 * Utility to safely access values on a deeply nested structure.
 * If path doesn't exist, return the default value.
 *
 * @param {array|object=} data - the structure to search.
 * @param {string|string[]} key - the path to the value delimited by `'.'`
 * @param {*} defaultValue - the value to return if the path doesn't exist.
 *
 * @example
 * const result1 = dataGet([{key:{prop:1}}], '0.key.prop') // 1;
 * const result2 = dataGet([{key:{prop:1}}], '*.key.prop') // [1];
 */
export default function dataGet<T>(
    // eslint-disable-next-line @typescript-eslint/default-param-last
    data: Collection<Data> | MaybeArray<Data> | undefined = undefined,
    key: Collection<string> | MaybeArray<string>,
    defaultValue?: T
): T | undefined {
    if (!data) {
        return defaultValue;
    }

    if (Collection.isCollection<string>(key)) {
        key = key.toArray();
    }

    const keys = Array.isArray(key) ? key : key.split('.');
    let value = data;

    for (let i = 0; i < keys.length; i++) {
        if (keys[i] === '*') {
            if (Collection.isCollection<Data>(value)) {
                value = value.toArray();
            }

            if (!Array.isArray(value)) {
                return defaultValue;
            }

            value = value.map((v: Data) => {
                return dataGet(v, keys.slice(i + 1), defaultValue)!;
            });

            const stars = keys.slice(i).filter(k => k === '*').length;

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

        if (!(keys[i]! in value)) {
            i = keys.length;
            return defaultValue;
        }

        value = value[keys[i] as keyof typeof value];
    }

    return value as T;
}
