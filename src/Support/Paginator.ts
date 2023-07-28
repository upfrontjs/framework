import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import InvalidOffsetException from '../Exceptions/InvalidOffsetException';
import type { MaybeArray } from './type';

/**
 * Utility to paginate data.
 */
export default class Paginator<T> implements Iterable<T> {
    /**
     * The internal current page. This is always at least 1.
     *
     * @type {number}
     */
    protected internalCurrentPage = 1;

    /**
     * The internal current page.
     *
     * @type {number}
     */
    public get currentPage(): number {
        return this.internalCurrentPage;
    }

    /**
     * The internal tacker for the items per page count.
     *
     * @type {number}
     */
    protected internalItemsPerPage = 10;

    /**
     * Number of items to return per page.
     *
     * @type {number}
     */
    public get itemsPerPage(): number {
        return this.internalItemsPerPage;
    }

    /**
     * Current page's items.
     *
     * @type {any[]}
     */
    public items: T[] = [];

    /**
     * All the items passed to the paginator.
     *
     * @type {any[]}
     */
    protected readonly elements: T[];

    /**
     * Boolean indicating whether the paginator should repeat or not.
     *
     * @type {boolean}
     */
    public readonly wrapsAround: boolean;

    /**
     * Get the number of pages available.
     *
     * @return {number}
     */
    public get pageCount(): number {
        return Math.ceil(this.elements.length / this.internalItemsPerPage);
    }

    /**
     * Get the length of all the items within the paginator.
     */
    public get length(): number {
        return this.elements.length;
    }

    /**
     * Determine whether the paginator has a previous page.
     *
     * @return {boolean}
     */
    public get hasPrevious(): boolean {
        return this.internalCurrentPage > 1;
    }

    /**
     * Determine whether the paginator has a next page.
     *
     * @return {boolean}
     */
    public get hasNext(): boolean {
        return !!this.elements.slice(this.internalCurrentPage * this.internalItemsPerPage).length;
    }

    /**
     * Enable array like behaviour.
     */
    public *[Symbol.iterator](): Iterator<T> {
        for (let i = 0; i < this.elements.length; i++) {
            yield this.elements[i]!;
        }
    }

    /**
     * The paginator constructor.
     *
     * @param {any|any[]} elements
     * @param {number} itemsPerPage
     * @param {boolean} wrapsAround
     *
     * @return {this}
     */
    public constructor(elements?: MaybeArray<T>, itemsPerPage = 10, wrapsAround = false) {
        elements = elements !== undefined ? cloneDeep(elements) : [];
        this.wrapsAround = wrapsAround;
        this.internalItemsPerPage = itemsPerPage;
        this.elements = Array.isArray(elements) ? elements : [elements];
        this._setPageItems();

        return this;
    }

    /**
     * The setter for the current page items.
     *
     * @private
     *
     * @return {this}
     */
    private _setPageItems(): this {
        const start = (this.internalCurrentPage - 1) * this.internalItemsPerPage;

        this.items = this.elements.slice(start, start + this.internalItemsPerPage);

        return this;
    }

    /**
     * The setter method for the itemsPerPage property.
     *
     * @param {number} count
     *
     * @return {this}
     */
    public setItemsPerPage(count: number): this {
        this.internalItemsPerPage = Number(count);
        this._setPageItems();

        return this;
    }

    /**
     * Set thr paginator to the first page.
     *
     * @return {this}
     */
    public first(): this {
        this.internalCurrentPage = 1;
        this._setPageItems();

        return this;
    }

    /**
     * Set the paginator to the last page.
     *
     * @return {this}
     */
    public last(): this {
        this.internalCurrentPage = this.pageCount > 0 ? this.pageCount : 1;
        this._setPageItems();

        return this;
    }

    /**
     * Set the page to the given page number.
     *
     * @param pageNum
     *
     * @return {this}
     */
    public page(pageNum: number): this {
        if (pageNum <= this.pageCount && pageNum >= 1) {
            this.internalCurrentPage = pageNum;
            this._setPageItems();
        }

        return this;
    }

    /**
     * Set paginator to the previous page.
     *
     * @return {this}
     */
    public previous(): this {
        if (this.hasPrevious) {
            this.internalCurrentPage--;
            this._setPageItems();

            return this;
        }

        if (this.wrapsAround) {
            this.last();
        }

        return this;
    }

    /**
     * Set the paginator to the next page.
     *
     * @return {this}
     */
    public next(): this {
        if (this.hasNext) {
            this.internalCurrentPage++;
            this._setPageItems();

            return this;
        }

        if (this.wrapsAround) {
            this.first();
        }

        return this;
    }

    /**
     * Get the page number where the item first occurs.
     * If not found return -1
     *
     * @param {any} item
     *
     * @private
     */
    public pageNumberOf(item: T): number {
        const pageIndex = this.getPages().findIndex(element => element.findIndex(elem => isEqual(elem, item)) !== -1);

        return pageIndex === -1 ? -1 : pageIndex + 1;
    }

    /**
     * Determine whether the given item is on page based on deep equality.
     *
     * @param {any} item
     */
    public isOnPage(item: T): boolean {
        return !!this.items.filter(elem => isEqual(elem, item)).length;
    }

    /**
     * Jump to the page where the item is based on deep equality.
     *
     * @param {any} item
     */
    public jumpToItem(item: T): this {
        const pageNumber = this.pageNumberOf(item);

        if (pageNumber === -1) {
            throw new InvalidOffsetException('Given item does not exists on the paginator');
        }

        if (this.internalCurrentPage === pageNumber) {
            return this;
        }

        this.page(pageNumber);
        return this;
    }

    /**
     * Determine whether the paginator has the given item.
     */
    public has(item: T): boolean {
        return this.elements.findIndex(elem => isEqual(elem, item)) !== -1;
    }

    /**
     * Add one or more items to the end of the paginator.
     * Returns the new length of the paginator.
     *
     * @param {...any} items
     */
    public push(...items: T[]): number {
        this.elements.push(...items);
        this._setPageItems();

        return this.length;
    }

    /**
     * Add one or more items to the beginning of the paginator.
     * Returns the new length of the paginator.
     *
     * @param {...any} items
     */
    public unshift(...items: T[]): number {
        this.elements.unshift(...items);
        this._setPageItems();

        return this.length;
    }

    /**
     * Remove and return the last element of the paginator.
     *
     * @return {any}
     */
    public pop(): T | undefined {
        // this is the last page and there's only 1 item on page
        if (this.pageCount === this.currentPage && this.items.length === 1) {
            this.previous();
        }

        const lastElement = this.elements.pop();
        this._setPageItems();

        return lastElement;
    }

    /**
     * Remove and return the first element of the paginator.
     *
     * @return {any}
     */
    public shift(): T | undefined {
        // this is the last page and there's only 1 item on page
        if (this.pageCount === this.currentPage && this.items.length === 1) {
            this.previous();
        }

        const firstElement = this.elements.shift();
        this._setPageItems();

        return firstElement;
    }

    /**
     * Get all the items passed to the paginator.
     *
     * @return {any[]}
     */
    public getAll(): T[] {
        return cloneDeep(this.elements);
    }

    /**
     * Get the items in a matrix where one array is one page.
     *
     * @return {any[][]}
     */
    public getPages(): T[][] {
        const elementMatrix: T[][] = [];

        for (let i = 0; i <= this.pageCount - 1; i++) {
            elementMatrix.push(this.elements.slice(i * this.internalItemsPerPage, (i + 1) * this.internalItemsPerPage));
        }

        return cloneDeep(elementMatrix);
    }
}
