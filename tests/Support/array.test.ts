import Collection from '../../Illuminate/Support/Collection';
import Paginator from '../../Illuminate/Pagination/Paginator';
import '../../Illuminate/Support/array';

describe('array helpers', () => {
    it('can return a collection by calling collect()', () => {
        expect([1, 2].collect()).toBeInstanceOf(Collection);
        expect([1, 2].collect().first()).toBe(1);
    });

    it('can create a collection by calling collect() statically', () => {
        expect(Array.collect()).toBeInstanceOf(Collection);
        expect(Array.collect([1, 2]).first()).toBe(1);
    });

    it('can return a paginator by calling paginate() on an array', () => {
        expect([1, 2].paginate()).toBeInstanceOf(Paginator);
        expect([1, 2].paginate().hasPages()).toBe(false);
    });

    it('can return a paginator by calling paginate() statically', () => {
        expect(Array.paginate([1, 2])).toBeInstanceOf(Paginator);
        expect(Array.paginate([1, 2]).hasPages()).toBe(false);
    });

    describe('array.wrap()', () => {
        it('can wrap a value in an array if it isn\'t already an array', () => {
            expect(Array.wrap([1, 2])).toStrictEqual([1, 2]);
            expect(Array.wrap(1)).toStrictEqual([1]);
            expect(Array.wrap([])).toStrictEqual([]);
            expect(Array.wrap([[]])).toStrictEqual([[]]);
        });

        it('can returns empty collection on undefined and null', () => {
            expect(Array.wrap(null)).toStrictEqual([]);
            expect(Array.wrap(undefined)).toStrictEqual([]);
            expect(Array.wrap(false)).toStrictEqual([false]);
        });
    });

});
