import Collection from './Collection';
import Paginator from '../Pagination/Paginator';
import type Model from '../Calliope/Model';
import FactoryBuilder from '../Calliope/Factory/FactoryBuilder';

/**
 * Globally available methods on the window.
 */
declare global {
    /**
     * Create a collection from the array.
     *
     * @param {any} items
     *
     * @return {Collection}
     */
    function collect<T extends any>(items?: T[]): Collection<T>;

    /**
     * Construct a paginator instance.
     *
     * @param {...any} items
     *
     * @return {Paginator}
     */
    function paginate<T extends any>(items: T[]): Paginator<T>;

    /**
     * Return the Factory builder.
     *
     * @param {Model} modelConstructor
     * @param {number} amount
     *
     * @return {Paginator}
     */
    function factory<T extends Model>(modelConstructor: new () => T, amount?: number): FactoryBuilder<T>;
}

if (!!window && !('collect' in window)) {
    Object.defineProperty(window, 'collect', {
        value: function (items?: any[]): Collection<any> {
            return new Collection(items);
        }
    });
}

if (!!window && !('paginate' in window)) {
    Object.defineProperty(window, 'paginate', {
        value: function (items: any[]) {
            return new Paginator(items);
        }
    });
}

if (!!window && !('factory' in window)) {
    Object.defineProperty(window, 'factory', {
        value: function<T extends Model>(modelConstructor: new () => T, amount = 1): FactoryBuilder<T> {
            return new FactoryBuilder(modelConstructor).times(amount);
        }
    });
}

/**
 * Determine whether the given value is an object not including the type array.
 *
 * @internal
 *
 * @param {any} value
 *
 * @return {boolean}
 */
export const isObject = (value: any): value is NonNullable<Record<any, any>> => {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
};
