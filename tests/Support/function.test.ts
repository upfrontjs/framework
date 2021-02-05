import Collection from '../../src/Support/Collection';
import Paginator from '../../src/Support/Paginator';
import User from '../mock/Models/User';
import FactoryBuilder from '../../src/Calliope/Factory/FactoryBuilder';
import * as func from '../../src/Support/function';
import { types } from '../test-helpers';

describe('function helpers', () => {
    describe('collect()', () => {
        it('should create a collection by calling the collect() helper method', () => {
            expect(func.collect([1, 2])).toBeInstanceOf(Collection);
            expect(func.collect([1, 2]).first()).toBe(1);
        });
    });

    describe('paginate()', () => {
        it('should create a paginator by calling the paginate() helper method', () => {
            expect(func.paginate([1, 2], 10, false)).toBeInstanceOf(Paginator);
        });
    });

    describe('factory()', () => {
        it('should create a factory builder by calling the factory() helper method', () => {
            expect(func.factory(User)).toBeInstanceOf(FactoryBuilder);
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
                expect(func.isObjectLiteral(type)).toBe(false);
            });

            expect(func.isObjectLiteral({})).toBe(true);
        });
    });

    describe('isConstructableUserClass()', () => {
        const typesWithoutClass = types.filter(t => !/^\s*class\s+/.test(String(t)));

        it('should correctly evaluate if types are user defined classes', () => {
            typesWithoutClass.forEach(type => {
                expect(func.isConstructableUserClass(type)).toBe(false);
            });

            // eslint-disable-next-line @typescript-eslint/no-extraneous-class
            expect(func.isConstructableUserClass(class C {})).toBe(true);
        });
    });
});
