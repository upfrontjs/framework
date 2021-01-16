import Collection from '../../src/Support/Collection';
import Paginator from '../../src/Pagination/Paginator';
import User from '../mock/Models/User';
import FactoryBuilder from '../../src/Calliope/Factory/FactoryBuilder';
import { collect, paginate, factory } from '../../src/Support/function';

describe('function helpers', () => {
    it('should create a collection by calling the collect() helper method', () => {
        expect(collect([1, 2])).toBeInstanceOf(Collection);
        expect(collect([1, 2]).first()).toBe(1);
    });

    it('should create a paginator by calling the paginate() helper method', () => {
        expect(paginate([1, 2])).toBeInstanceOf(Paginator);
        expect(paginate([1, 2]).hasPages()).toBe(false);
    });

    it('should create a factory builder by calling the factory() helper method', () => {
        expect(factory(User)).toBeInstanceOf(FactoryBuilder);
    });
});
