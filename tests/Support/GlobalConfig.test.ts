import GlobalConfig from '../../src/Support/GlobalConfig';
import API from '../../src/Services/API';
import type Configuration from '../../src/Contracts/Configuration';

let config: GlobalConfig<Configuration> = new GlobalConfig();

describe('config', () => {
    beforeEach(() => {
        config.unset('api');
    });

    it('should have the baseEndpoint persisted from the setupTests.ts', () => {
        expect(config.get('baseEndPoint')).toBe('https://test-api-endpoint.com');
    });

    describe('construct()', () => {
        it('should be instantiated with some config values', function () {
            config = new GlobalConfig({ api: new API });

            expect(config.has('api')).toBe(true);
        });
    });

    describe('get()', () => {
        it('should get a specified value', function () {
            config.set('api', new API());

            expect(config.get('api')).toStrictEqual(new API());
        });

        it('should return the default if key not found', function () {
            expect(config.get('something', 'default')).toBe('default');
        });
    });

    describe('has()', () => {
        it('should determine whether the value is set', function () {
            expect(config.has('api')).toBe(false);

            config.set('api', new API());

            expect(config.has('api')).toBe(true);
        });
    });

    describe('set()', () => {
        it('should set a value', function () {
            expect(config.has('api')).toBe(false);

            config.set('api', new API());

            expect(config.has('api')).toBe(true);
        });
    });

    describe('unset()', () => {
        it('should set a value', function () {
            config.set('api', new API());

            expect(config.has('api')).toBe(true);

            config.unset('api');

            expect(config.has('api')).toBe(false);
        });
    });

    describe('reset()', () => {
        it('should empty the configuration', function () {
            config.set('api', new API());

            expect(config.has('api')).toBe(true);

            config.reset();

            expect(config.has('api')).toBe(false);
        });
    });
});
