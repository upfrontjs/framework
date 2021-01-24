import Collection from '../../src/Support/Collection';
import Paginator from '../../src/Support/Paginator';
import '../../src/Support/array';

describe('array helpers', () => {
    it('should return a collection by calling collect()', () => {
        expect([1, 2].collect()).toBeInstanceOf(Collection);
        expect([1, 2].collect().first()).toBe(1);
    });

    it('should create a collection by calling collect() statically', () => {
        expect(Array.collect()).toBeInstanceOf(Collection);
        expect(Array.collect([1, 2]).first()).toBe(1);
    });

    it('should return a paginator by calling paginate() on an array', () => {
        expect([1, 2].paginate()).toBeInstanceOf(Paginator);
        expect([1, 2].paginate().hasPages).toBe(false);
    });

    it('should return a paginator by calling paginate() statically', () => {
        expect(Array.paginate([1, 2])).toBeInstanceOf(Paginator);
        expect(Array.paginate([1, 2]).hasPages).toBe(false);
    });

    describe('array.wrap()', () => {
        it('should wrap a value in an array if it isn\'t already an array', () => {
            expect(Array.wrap([1, 2])).toStrictEqual([1, 2]);
            expect(Array.wrap(1)).toStrictEqual([1]);
            expect(Array.wrap([])).toStrictEqual([]);
            expect(Array.wrap([[]])).toStrictEqual([[]]);
        });

        it('should returns empty collection on undefined and null', () => {
            expect(Array.wrap(null)).toStrictEqual([]);
            expect(Array.wrap(undefined)).toStrictEqual([]);
            expect(Array.wrap(false)).toStrictEqual([false]);
        });
    });

});
