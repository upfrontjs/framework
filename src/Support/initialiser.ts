import Collection from './Collection';
import Paginator from './Paginator';
import type Model from '../Calliope/Model';
import FactoryBuilder from '../Calliope/Factory/FactoryBuilder';
import type Factory from '../Calliope/Factory/Factory';

/**
 * Create a collection from the array.
 *
 * @param {any} items
 *
 * @return {Collection}
 */
export function collect<T>(items?: T | T[]): Collection<T> {
    return new Collection(items);
}

/**
 * Construct a paginator instance.
 *
 * @param {any[]=} items
 * @param {number} itemsPerPage
 * @param {boolean} wrapsAround
 *
 * @return {Paginator}
 */
export function paginate<T>(items?: any[], itemsPerPage = 10, wrapsAround = false): Paginator<T> {
    return new Paginator(items, itemsPerPage, wrapsAround);
}

/**
 * Return the Factory builder.
 *
 * @param {Model} modelConstructor
 * @param {number} amount
 *
 * @return {Paginator}
 */
export function factory<T extends Model, F extends Factory<T> = Factory<T>>(
    modelConstructor: new () => T,
    amount = 1
): FactoryBuilder<T, F> {
    return new FactoryBuilder<T, F>(modelConstructor).times(amount);
}
