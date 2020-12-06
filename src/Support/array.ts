import Collection from './Collection';
import Paginator from '../Pagination/Paginator';

export {}; // this file needs to be a module

declare global {
    interface Array<T> {
        /**
         * Create a collection from the array.
         *
         * @return {Collection}
         */
        collect(): Collection<T>;

        /**
         * Construct a paginator instance.
         *
         * @return {Paginator}
         */
        paginate(): Paginator<T>;
    }

    interface ArrayConstructor {
        /**
         * Create a collection from the array.
         *
         * @param {any} items
         *
         * @return {Collection}
         */
        collect(items?: any[]): Collection<any>;

        /**
         * Ensure the given value is an array.
         *
         * @param {any} value
         *
         * @return {array};
         */
        wrap(value: any): Array<any>;

        /**
         * Construct a paginator instance.
         *
         * @param {any} items
         *
         * @return {Paginator}
         */
        paginate(items: any[]): Paginator<any>;
    }
}

if (!('collect' in Array.prototype)) {
    Object.defineProperty(Array.prototype, 'collect', {
        value: function (): Collection<any> {
            return new Collection(this);
        }
    });
}

if (!('collect' in Array)) {
    Object.defineProperty(Array, 'collect', {
        value: function (items?: any[]): Collection<any> {
            return new Collection(items);
        }
    });
}

if (!('paginate' in Array.prototype)) {
    Object.defineProperty(Array.prototype, 'paginate', {
        value: function () {
            return new Paginator(this);
        }
    });
}

if (!('paginate' in Array)) {
    Object.defineProperty(Array, 'paginate', {
        value: function (items: any[]) {
            return new Paginator(items);
        }
    });
}

if (!('wrap' in Array)) {
    Object.defineProperty(Array, 'wrap', {
        value: function (value: any): Array<any> {
            if (!value && typeof value !== 'boolean') {
                value = [];
            }

            if (!Array.isArray(value)) {
                value = [value];
            }

            return value;
        }
    });
}
