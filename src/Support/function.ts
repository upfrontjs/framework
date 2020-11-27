import Collection from './Collection';
import Paginator from '../Pagination/Paginator';
import type Model from '../Calliope/Model';
import FactoryBuilder from '../Calliope/Factory/FactoryBuilder';

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

    /**
     * Return the Factory builder.
     *
     * @param {Model} modelConstructor
     * @param {number} amount
     *
     * @return {Paginator}
     */
    function factory(modelConstructor: new () => Model, amount?: number): FactoryBuilder;
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

if (!!window && !('factory' in window)) {
    Object.defineProperty(window, 'factory', {
        value: function (modelConstructor: new () => Model, amount = 1): FactoryBuilder {
            return new FactoryBuilder(modelConstructor).times(amount);
        }
    });
}


export const isObject = (value: any): value is NonNullable<Record<any, any>> => {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
};
