import Collection from '../../src/Support/Collection';
import Paginator from '../../src/Pagination/Paginator';
import '../../src/Support/function';
import User from '../mock/Models/User';
import FactoryBuilder from '../../src/Calliope/Factory/FactoryBuilder';

describe('function helpers', () => {
    it('should create a collection by calling the collect() helper method', () => {
        expect(window.collect(1, 2)).toBeInstanceOf(Collection);
        expect(window.collect([1, 2]).first()).toBe(1);

        expect(collect(1, 2)).toBeInstanceOf(Collection);
        expect(collect([1, 2]).first()).toBe(1);
    });

    it('should create a paginator by calling the paginate() helper method', () => {
        expect(paginate([1, 2])).toBeInstanceOf(Paginator);
        expect(paginate([1, 2]).hasPages()).toBe(false);

        expect(window.paginate([1, 2])).toBeInstanceOf(Paginator);
        expect(window.paginate([1, 2]).hasPages()).toBe(false);
    });

    it('should create a factory builder by calling the factory() helper method', () => {
        expect(factory(User)).toBeInstanceOf(FactoryBuilder);

        expect(window.factory(User)).toBeInstanceOf(FactoryBuilder);
    });
});
