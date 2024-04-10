import * as init from '../../src/Support/initialiser';
import Collection from '../../src/Support/Collection';
import Paginator from '../../src/Support/Paginator';
import User from '../mock/Models/User';
import FactoryBuilder from '../../src/Calliope/Factory/FactoryBuilder';
import { describe, expect, it } from '@jest/globals';

describe('initialiser helpers', () => {
    describe('collect()', () => {
        it('should create a collection by calling the collect() helper method', () => {
            expect(init.collect([1, 2])).toBeInstanceOf(Collection);
            expect(init.collect([1, 2]).first()).toBe(1);
        });
    });

    describe('paginate()', () => {
        it('should create a paginator by calling the paginate() helper method', () => {
            expect(init.paginate([1, 2], 10, false)).toBeInstanceOf(Paginator);
        });
    });

    describe('factory()', () => {
        it('should create a factory builder by calling the factory() helper method', () => {
            expect(init.factory(User)).toBeInstanceOf(FactoryBuilder);
        });
    });
});
