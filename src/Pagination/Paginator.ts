import InvalidArgumentException from '../Exceptions/InvalidArgumentException';
import { isEqual, cloneDeep } from 'lodash';
import InvalidOffsetException from '../Exceptions/InvalidOffsetException';

/**
 * Utility to paginate data.
 */
class Paginator<T> implements Iterable<T> {
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
    get pageCount(): number {
        return Math.ceil(this.elements.length / this.itemsPerPage);
    }

    /**
     * TGet the length of all the items within the paginator.
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
        return this.currentPage > 1;
    }

    /**
     * Determine whether the paginator has a next page.
     *
     * @return {boolean}
     */
    public get hasNext(): boolean {
        const start = this.currentPage * this.itemsPerPage;

        return !!this.elements.slice(start, start + this.itemsPerPage).length;
    }

    /**
     * Determine whether the Paginator has pages or not.
     *
     * @return {boolean}
     */
    public get hasPages(): boolean {
        return this.pageCount > 1;
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
    constructor(elements: T[], itemsPerPage = 10, wrapsAround = false) {
        if (!elements?.length) {
            throw new InvalidArgumentException('Paginator expect at least one element in the constructor.');
        }

        this.wrapsAround = wrapsAround;
        this.itemsPerPage = itemsPerPage;
        this.elements = Array.isArray(elements) ? cloneDeep(elements) : [cloneDeep(elements)];
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
     * The setter method for the itemsPerPage property.
     *
     * @param {number} count
     *
     * @return {this}
     */
    public setItemsPerPage(count: number): this {
        this.itemsPerPage = Number(count);
        this._setPageItems();

        return this;
    }

    /**
     * Set thr paginator to the first page.
     *
     * @return {this}
     */
    public first(): this {
        this.currentPage = 1;
        this._setPageItems();

        return this;
    }

    /**
     * Set the paginator to the last page.
     *
     * @return {this}
     */
    public last(): this {
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
    public page(pageNum: number): this {
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
    public previous(): this {
        if (this.hasPrevious) {
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
    public next(): this {
        if (this.hasNext) {
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

        if (this.currentPage === pageNumber) {
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

        return this.length;
    }

    /**
     * Remove and return the last element of the paginator.
     *
     * @return {any}
     */
    public pop(): T | undefined {
        return this.elements.pop();
    }

    /**
     * Remove and return the first element of the paginator.
     *
     * @return {any}
     */
    public shift(): T | undefined {
        return this.elements.shift();
    }

    /**
     * Get all the items passed to the paginator.
     *
     * @return {any[]}
     */
    public getAll(): T[] {
        return this.elements;
    }

    /**
     * Get the items in a matrix where one array is one page.
     *
     * @return {any[][]}
     */
    public getPages(): T[][] {
        const elementMatrix: T[][] = [];

        for (let i = 0; i <= this.pageCount - 1; i++) {
            elementMatrix.push(this.elements.slice(i * this.itemsPerPage, (i + 1) * this.itemsPerPage));
        }

        return elementMatrix;
    }
}

export default Paginator;
