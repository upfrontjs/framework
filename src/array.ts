import type Collection from './Support/Collection';
import type Paginator from './Support/Paginator';
import collect from './Support/initialiser/collect';
import paginate from './Support/initialiser/paginate';
import wrap from './Support/array/wrap';

declare global {
    /**
     * Globally available methods on Array.prototype.
     */
    interface Array<T> {
        /**
         * Create a collection from the array.
         *
         * @return {Collection}
         */
        collect: () => Collection<T>;

        /**
         * Construct a paginator instance.
         *
         * @return {Paginator}
         */
        paginate: () => Paginator<T>;
    }

    /**
     * Globally available methods on Array.
     */
    interface ArrayConstructor {
        /**
         * Create a collection from the array.
         *
         * @param {any} items
         *
         * @return {Collection}
         */
        collect: (items?: any[]) => ReturnType<typeof collect>;

        /**
         * Ensure the given value is an array.
         *
         * @param {any} value
         *
         * @return {array};
         */
        wrap: (value?: any) => any[];

        /**
         * Construct a paginator instance.
         *
         * @param {any} items
         *
         * @return {Paginator}
         */
        paginate: (items: any[]) => ReturnType<typeof paginate>;
    }
}

if (!('collect' in Array.prototype)) {
    Object.defineProperty(Array.prototype, 'collect', {
        value: function (): ReturnType<typeof collect> {
            return collect(this);
        }
    });
}

if (!('collect' in Array)) {
    Object.defineProperty(Array, 'collect', {
        value: function (items?: any[]): ReturnType<typeof collect> {
            return collect(items);
        }
    });
}

if (!('paginate' in Array.prototype)) {
    Object.defineProperty(Array.prototype, 'paginate', {
        value: function (): ReturnType<typeof paginate> {
            return paginate(this as []);
        }
    });
}

if (!('paginate' in Array)) {
    Object.defineProperty(Array, 'paginate', {
        value: function (items: any[]): ReturnType<typeof paginate> {
            return paginate(items);
        }
    });
}

if (!('wrap' in Array)) {
    Object.defineProperty(Array, 'wrap', {
        value: function (value?: any) {
            return arguments.length ? wrap(value) : wrap();
        }
    });
}
