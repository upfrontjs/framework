import GlobalConfig from '../../src/Support/GlobalConfig';
import API from '../../src/Services/API';
import type Configuration from '../../src/Contracts/Configuration';

let config: GlobalConfig<Configuration> = new GlobalConfig();

describe('GlobalConfig', () => {
    beforeEach(() => {
        config.unset('api');
    });

    it('should have the baseEndpoint persisted from the setupTests.ts', () => {
        expect(config.get('baseEndPoint')).toBe('https://test-api-endpoint.com');
    });

    describe('construct()', () => {
        it('should be instantiated with some config values', function () {
            config = new GlobalConfig({ api: API });

            expect(config.get('api')).toStrictEqual(API);
        });

        it('should prevent changing values by reference when merging config', () => {
            const deepObj = { count: 1 };
            const obj = { test: deepObj };
            config.set('obj', obj);

            new GlobalConfig(obj);

            deepObj.count++;

            expect(config.get('obj').test.count).toBe(1);
        });
    });

    describe('get()', () => {
        it('should get a specified value', function () {
            config.set('api', API);

            expect(config.get('api')).toStrictEqual(API);
        });

        it('should return the default if key not found', function () {
            expect(config.get('something', 'default')).toBe('default');
        });

        it('should return falsy values if set', () => {
            config.set('test', false);
            expect(config.get('test')).toBe(false);
            expect(config.get('test', 'decoy value')).toBe(false);

            config.set('test', null);
            expect(config.get('test')).toBeNull();
            expect(config.get('test', 'decoy value')).toBeNull();

            config.set('test', undefined);
            expect(config.get('test')).toBeUndefined();
            expect(config.get('test', 'decoy value')).toBeUndefined();
        });

        it('should prevent changing values by reference by returning clone', () => {
            const obj = { test: 1 };
            config.set('test', obj);

            const copy = config.get('test');

            copy.test++;

            expect(config.get('test').test).toBe(1);
            expect(obj.test).toBe(1);
        });
    });

    describe('has()', () => {
        it('should determine whether the value is set', function () {
            expect(config.has('api')).toBe(false);

            config.set('api', API);

            expect(config.has('api')).toBe(true);
        });
    });

    describe('set()', () => {
        it('should set a value', function () {
            expect(config.has('api')).toBe(false);

            config.set('api', API);

            expect(config.get('api')).toStrictEqual(API);
        });


        it('should prevent changing value by reference', () => {
            const obj = { test: 1 };
            config.set('test', obj);

            expect(config.get('test').test).toBe(1);

            obj.test++;

            expect(config.get('test').test).toBe(1);
        });


    });

    describe('unset()', () => {
        it('should set a value', function () {
            config.set('api', API);

            expect(config.has('api')).toBe(true);

            config.unset('api');

            expect(config.has('api')).toBe(false);
        });
    });

    describe('reset()', () => {
        it('should empty the configuration', function () {
            config.set('api', API);

            expect(config.has('api')).toBe(true);

            config.reset();

            expect(config.has('api')).toBe(false);
        });
    });
});
