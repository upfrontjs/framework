import GlobalConfig from '../../src/Support/GlobalConfig';
import API from '../../src/Services/API';
import type Configuration from '../../src/Contracts/Configuration';

// initial type is required so set's assertion doesn't trigger circular analysis for typescript
/* eslint-disable-next-line @typescript-eslint/consistent-generic-constructors */
const config: GlobalConfig<Configuration> = new GlobalConfig();

describe('GlobalConfig', () => {
    beforeEach(() => {
        config.unset('api');
        GlobalConfig.usedAsReference = ['headers'];
    });

    it('should have the baseEndpoint persisted from the setupTests.ts', () => {
        expect(config.get('baseEndPoint')).toBe('https://test-api-endpoint.com');
    });

    describe('.usedAsReference', () => {
        it('should make set and get return by reference', () => {
            // typeof new Headers() === 'object'
            config.set('headers', new Headers());

            expect(config.get('headers')).toBeInstanceOf(Headers);

            const myObject = { key: 'value' };

            config.set('myObject', myObject);

            myObject.key = 'updated value';
            expect(config.get('myObject').key).toBe('value');

            GlobalConfig.usedAsReference.push('myObject');
            config.set('myObject', myObject);
            myObject.key = 'updated value';
            expect(config.get('myObject').key).toBe('updated value');
        });

        it('should return all values by reference if value set to \'*\'', () => {
            GlobalConfig.usedAsReference = ['*'];

            const myArray: number[] = [];
            const myObject = { key: 'value' };
            config.set('myObject', myObject);
            config.set('myArray', myArray);

            myArray.push(1);
            myObject.key = 'updated value';

            expect(config.get('myObject').key).toBe('updated value');
            expect(config.get('myArray')).toHaveLength(1);
        });
    });

    describe('construct()', () => {
        it('should be instantiated with some config values', () => {
            new GlobalConfig({ api: API });

            expect(config.get('api')).toStrictEqual(API);
        });

        it('should prevent changing values by reference when merging config', () => {
            const deepObj = { count: 1 };
            const obj = { test: deepObj };

            new GlobalConfig({ obj });

            deepObj.count++;

            // eslint-disable-next-line max-len
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion,@typescript-eslint/non-nullable-type-assertion-style
            expect((config.get('obj') as typeof obj).test.count).toBe(1);
        });
    });

    describe('get()', () => {
        it('should get a specified value', () => {
            config.set('api', API);

            config.set('something', 3);

            config.get('something');

            expect(config.get('api')).toStrictEqual(API);
        });

        it('should return the default if key not found', () => {
            expect(config.get('newKey', 'default')).toBe('default');
        });

        it('should return falsy values if set', () => {
            config.set('test', false);
            expect(config.get('test')).toBe(false);
            expect(config.get('test', 'decoy value')).toBe(false);

            config.set('test1', null);
            expect(config.get('test1')).toBeNull();
            expect(config.get('test1', 'decoy value')).toBeNull();

            config.set('test2', undefined);
            expect(config.get('test2')).toBeUndefined();
            expect(config.get('test2', 'decoy value')).toBeUndefined();
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
        it('should set a value', () => {
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
