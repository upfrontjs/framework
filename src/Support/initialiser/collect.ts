import Collection from '../Collection';

/**
 * Create a collection from the array.
 *
 * @param {any} items
 *
 * @return {Collection}
 */
export default function collect<T>(items?: T | T[]): Collection<T> {
    return new Collection(items);
}
