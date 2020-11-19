import Config from '../../src/Support/Config';
import API from '../../src/Services/API';

let config = new Config();

describe('config', () => {
    beforeEach(() => {
        config.unset('API');
    });

    describe('construct()', () => {
        it('can be instantiated with some config values', function () {
            config = new Config({ API: new API });

            expect(config.has('API')).toBe(true);
        });
    });

    describe('get()', () => {
        it('can get a specified value', function () {
            config.set('API', new API());

            expect(config.get('API')).toStrictEqual(new API());
        });

        it('can return the default if key not found', function () {
            expect(config.get('something', 'default')).toBe('default');
        });
    });

    describe('has()', () => {
        it('can determine whether the value is set', function () {
            expect(config.has('API')).toBe(false);

            config.set('API', new API());

            expect(config.has('API')).toBe(true);
        });
    });

    describe('set()', () => {
        it('can set a value', function () {
            expect(config.has('API')).toBe(false);

            config.set('API', new API());

            expect(config.has('API')).toBe(true);
        });
    });

    describe('unset()', () => {
        it('can set a value', function () {
            config.set('API', new API());

            expect(config.has('API')).toBe(true);

            config.unset('API');

            expect(config.has('API')).toBe(false);
        });
    });
});
