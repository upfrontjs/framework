import Collection from './Collection';
import Paginator from '../Pagination/Paginator';

export {}; // this file needs to be a module

declare global {
    /**
     * Create a collection from the array.
     *
     * @param {any} items
     *
     * @return {Collection}
     */
    function collect<T>(...items: T[]): Collection<T>;

    /**
     * Construct a paginator instance.
     *
     * @param {...any} items
     *
     * @return {Paginator}
     */
    function paginate<T>(items: T[]): Paginator<T>;
}

if (!!window && !('collect' in window)) {
    Object.defineProperty(window, 'collect', {
        value: function (...items: any[]): Collection<any> {
            return new Collection(...items);
        }
    });
}

if (!!window && !('paginate' in window)) {
    Object.defineProperty(window, 'paginate', {
        value: function (...items: any[]) {
            return new Paginator(items.flat());
        }
    });
}
