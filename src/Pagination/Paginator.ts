'use strict';

import InvalidArgumentException from '../Exceptions/InvalidArgumentException';

class Paginator<T> implements ArrayLike<T>, Iterable<T> {
    /**
     * The current page.
     *
     * @type {number}
     */
    public currentPage = 1;

    /**
     * Number of items to return per page.
     *
     * @type {number}
     */
    public itemsPerPage = 10;

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
    readonly elements: T[];

    /**
     * Boolean indicating whether the paginator should repeat or not.
     *
     * @type {boolean}
     */
    readonly wrapsAround: boolean;

    /**
     * Get the number of pages available.
     *
     * @return {number}
     */
    get pageCount(): number {
        return Math.ceil(this.elements.length / this.itemsPerPage);
    }

    /**
     * TGet the length of all the items within the paginator.
     */
    get length(): number {
        return this.elements.length;
    }

    /**
     * Enable array like behaviour.
     */
    public *[Symbol.iterator](): Iterator<T> {
        for (let i = 0; i < this.elements.length; i++) {
            yield this.elements[i] as T;
        }
    }

    /**
     * Allow indexing by numbers.
     */
    [index: number]: T;

    /**
     * The paginator constructor.
     *
     * @param {any[]} elements
     * @param {number} itemsPerPage
     * @param {boolean} wrapsAround
     *
     * @return {this}
     */
    constructor(elements: T[] = [], itemsPerPage = 10, wrapsAround = false) {
        if (!elements.length) {
            throw new InvalidArgumentException('Paginator expect at least one element in the constructor.');
        }

        this.wrapsAround = wrapsAround;
        this.itemsPerPage = itemsPerPage;
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
        const start = (this.currentPage - 1) * this.itemsPerPage;

        this.items = this.elements.slice(start, start + this.itemsPerPage);

        return this;
    }

    /**
     * Determine whether the component has pages or not.
     *
     * @return {boolean}
     */
    hasPages(): boolean {
        return this.pageCount > 1;
    }

    /**
     * The setter method for the itemsPerPage property.
     *
     * @param {number} count
     *
     * @return {this}
     */
    setItemsPerPage(count: number): this {
        this.itemsPerPage = Number(count);
        this._setPageItems();

        return this;
    }

    /**
     * Set thr paginator to the first page.
     *
     * @return {this}
     */
    first(): this {
        this.currentPage = 1;
        this._setPageItems();

        return this;
    }

    /**
     * Set the paginator to the last page.
     *
     * @return {this}
     */
    last(): this {
        this.currentPage = this.pageCount;
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
    page(pageNum: number): this {
        if (pageNum <= this.pageCount && pageNum >= 1) {
            this.currentPage = pageNum;
            this._setPageItems();
        }

        return this;
    }

    /**
     * Set paginator to the previous page.
     *
     * @return {this}
     */
    previous(): this {
        if (this.hasPrevious()) {
            this.currentPage--;
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
    next(): this {
        if (this.hasNext()) {
            this.currentPage++;
            this._setPageItems();

            return this;
        }

        if (this.wrapsAround) {
            this.first();
        }

        return this;
    }

    /**
     * Determine whether the paginator has a previous page.
     * @return {boolean}
     */
    hasPrevious(): boolean {
        return this.currentPage > 1;
    }

    /**
     * Determine whether the paginator has a next page.
     *
     * @return {boolean}
     */
    hasNext(): boolean {
        const start = this.currentPage * this.itemsPerPage;

        return !!this.elements.slice(start, start + this.itemsPerPage).length;
    }

    // jumpToItem(item): this {
    //
    // }

    /**
     * Get all the items passed to the paginator.
     *
     * @return {any[]}
     */
    getAll(): T[] {
        return this.elements;
    }
}

export default Paginator;
