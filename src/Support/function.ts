import Collection from './Collection';
import Paginator from '../Pagination/Paginator';
import type Model from '../Calliope/Model';
import FactoryBuilder from '../Calliope/Factory/FactoryBuilder';

/**
 * Create a collection from the array.
 *
 * @param {any} items
 *
 * @return {Collection}
 */
export function collect<T extends any>(items?: any): Collection<T> {
    return new Collection(items);
}

/**
 * Construct a paginator instance.
 *
 * @param {...any} items
 *
 * @return {Paginator}
 */
export function paginate<T extends any>(items: any[]): Paginator<T> {
    return new Paginator(items);
}

/**
 * Return the Factory builder.
 *
 * @param {Model} modelConstructor
 * @param {number} amount
 *
 * @return {Paginator}
 */
export function factory<T extends Model>(modelConstructor: new () => T, amount = 1): FactoryBuilder<T> {
    return new FactoryBuilder(modelConstructor).times(amount);
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
export function isObject (value: any): value is NonNullable<Record<any, any>> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
