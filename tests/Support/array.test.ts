import Collection from '../../src/Support/Collection';
import Paginator from '../../src/Support/Paginator';
import * as arr from '../../src/Support/array';
import '../../src/array';
// The Array/Array.prototype methods are the same as the helper methods so can be tested at the same time

describe('array helpers', () => {
    describe('collect()', () => {
        it('should return a collection by calling collect()', () => {
            expect([1, 2].collect()).toBeInstanceOf(Collection);
        });

        it('should create a collection by calling collect() statically', () => {
            expect(Array.collect()).toBeInstanceOf(Collection);
        });
    });

    describe('paginate()', () => {
        it('should return a paginator by calling paginate() on an array', () => {
            expect([1, 2].paginate()).toBeInstanceOf(Paginator);
        });

        it('should return a paginator by calling paginate() statically', () => {
            expect(Array.paginate([1, 2])).toBeInstanceOf(Paginator);
        });
    });

    describe('wrap()', () => {
        it('should wrap a value in an array if it isn\'t already an array', () => {
            expect(arr.wrap([1, 2])).toStrictEqual([1, 2]);
            expect(arr.wrap(1)).toStrictEqual([1]);
            expect(arr.wrap([])).toStrictEqual([]);
            expect(arr.wrap([[]])).toStrictEqual([[]]);

            expect(Array.wrap([1, 2])).toStrictEqual([1, 2]);
            expect(Array.wrap(1)).toStrictEqual([1]);
            expect(Array.wrap()).toStrictEqual([]);
            expect(Array.wrap([[]])).toStrictEqual([[]]);
        });

        it('should wrap falsy values', () => {
            [false, '', 0, null, undefined].forEach(val => {
                expect(arr.wrap(val)).toStrictEqual([val]);
            });
        });

        it('should return an empty collection if no argument given', () => {
            expect(arr.wrap()).toStrictEqual([]);
        });
    });
});
