import Collection from '../../src/Support/Collection';
import Paginator from '../../src/Support/Paginator';
import User from '../mock/Models/User';
import FactoryBuilder from '../../src/Calliope/Factory/FactoryBuilder';
import { collect, paginate, factory, isObjectLiteral, isConstructableUserClass } from '../../src/Support/function';
import { types } from '../test-helpers';

describe('function helpers', () => {
    describe('collect()', () => {
        it('should create a collection by calling the collect() helper method', () => {
            expect(collect([1, 2])).toBeInstanceOf(Collection);
            expect(collect([1, 2]).first()).toBe(1);
        });
    });

    describe('paginate()', () => {
        it('should create a paginator by calling the paginate() helper method', () => {
            expect(paginate([1, 2])).toBeInstanceOf(Paginator);
            expect(paginate([1, 2]).hasPages).toBe(false);
        });
    });

    describe('factory()', () => {
        it('should create a factory builder by calling the factory() helper method', () => {
            expect(factory(User)).toBeInstanceOf(FactoryBuilder);
        });
    });

    describe('isObject()', () => {
        const typesWithoutObjectLiteral = types.filter(t => !t
            || Object(t) !== t
            || t instanceof Function
            || Array.isArray(t)
        );

        it('should correctly evaluate if types are object literals', () => {
            typesWithoutObjectLiteral.forEach(type => {
                expect(isObjectLiteral(type)).toBe(false);
            });

            expect(isObjectLiteral({})).toBe(true);
        });
    });

    describe('isConstructableUserClass()', () => {
        const typesWithoutClass = types.filter(t => !/^\s*class\s+/.test(String(t)));

        it('should correctly evaluate if types are user defined classes', () => {
            typesWithoutClass.forEach(type => {
                expect(isConstructableUserClass(type)).toBe(false);
            });

            // eslint-disable-next-line @typescript-eslint/no-extraneous-class
            expect(isConstructableUserClass(class C {})).toBe(true);
        });
    });
});
