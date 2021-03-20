import Collection from './Collection';
import Paginator from './Paginator';
import type Model from '../Calliope/Model';
import FactoryBuilder from '../Calliope/Factory/FactoryBuilder';

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
 * @param {...any} items
 * @param {number} itemsPerPage
 * @param {boolean} wrapsAround
 *
 * @return {Paginator}
 */
export function paginate<T>(items: any[], itemsPerPage = 10, wrapsAround = false): Paginator<T> {
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
export function factory<T extends Model>(modelConstructor: new () => T, amount = 1): FactoryBuilder<T> {
    return new FactoryBuilder(modelConstructor).times(amount);
}

/**
 * Determine whether the given value is an object not including the type array.
 *
 * @param {any} value
 *
 * @return {boolean}
 */
export function isObjectLiteral<T extends Record<any, any>>(value: any): value is NonNullable<T> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Determine whether the given value is a class that can be called with the "new" keyword.
 *
 * @param {any} value
 *
 * @return {boolean}
 */
export function isConstructableUserClass<T extends new (...args: any) => any>(value: any): value is T {
    return value instanceof Function && /^\s*class\s+/.test(String(value));
}
