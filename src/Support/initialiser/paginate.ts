import Paginator from '../Paginator';

/**
 * Construct a paginator instance.
 *
 * @param {any[]=} items
 * @param {number} itemsPerPage
 * @param {boolean} wrapsAround
 *
 * @return {Paginator}
 */
export default function paginate<T>(items?: any[], itemsPerPage = 10, wrapsAround = false): Paginator<T> {
    return new Paginator(items, itemsPerPage, wrapsAround);
}
