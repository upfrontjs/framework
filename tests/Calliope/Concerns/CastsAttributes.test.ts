import Collection from '../../../src/Support/Collection';
import { config } from '../../setupTests';
import User from '../../mock/Models/User';
import { advanceTo } from 'jest-date-mock';
import { DateTime, dateTime } from '../../mock/Configuration/DateTime';
import InvalidArgumentException from '../../../src/Exceptions/InvalidArgumentException';
import type AttributeCaster from '../../../src/Contracts/AttributeCaster';
import LogicException from '../../../src/Exceptions/LogicException';

class CastingClass extends User {
    public getCasts() {
        return this.casts;
    }

    public publicCastAttribute(
        key: string,
        value: any,
        method: keyof AttributeCaster = 'get'
    ): never | unknown {
        return this.castAttribute(key, value, this.getRawAttributes(), method);
    }
}

let caster: CastingClass;

describe('CastsAttributes', () => {
    beforeEach(() => {
        caster = new CastingClass;
    });

    describe('mergeCasts()', () => {
        it('should merge the casts property with existing casts', () => {
            expect(caster.getCasts()).toStrictEqual({});

            caster.mergeCasts({ 'test': 'boolean' });
            expect(caster.getCasts()).toStrictEqual({ 'test': 'boolean' });

            caster.mergeCasts({ 'test': 'string', 'thing': 'number' });
            expect(caster.getCasts()).toStrictEqual({ 'test': 'string', 'thing': 'number' });
        });
    });

    describe('hasCast()', () => {
        it('should merge the casts property with existing casts', () => {
            expect(caster.hasCast('test')).toBe(false);

            caster.mergeCasts({ 'test': 'boolean' });

            expect(caster.hasCast('test')).toBe(true);
        });
    });

    describe('castAttribute()', () => {
        it('should return the original value if no cast is defined', () => {
            expect(caster.publicCastAttribute('test', '1')).toBe('1');
        });

        it('should cast to a boolean', () => {
            caster.mergeCasts({ 'test': 'boolean' });

            expect(caster.publicCastAttribute('test', '1')).toBe(true);
            expect(caster.publicCastAttribute('test', 1)).toBe(true);
            expect(caster.publicCastAttribute('test', 'true')).toBe(true);

            expect(caster.publicCastAttribute('test', '0')).toBe(false);
            expect(caster.publicCastAttribute('test', 0)).toBe(false);
            expect(caster.publicCastAttribute('test', 'false')).toBe(false);

            const func = () => caster.publicCastAttribute('test', 'random value');
            expect(func).toThrow(new LogicException(
                '\'test\' is not castable to a boolean type in \'' + caster.constructor.name + '\'.'
            ));
        });

        it('should cast to a string', () => {
            caster.mergeCasts({ 'test': 'string' });

            expect(caster.publicCastAttribute('test', 1)).toBe('1');
            expect(caster.publicCastAttribute('test', undefined)).toBe('undefined');
            expect(caster.publicCastAttribute('test', false)).toBe('false');
            //calls the to primitive string method
            expect(caster.publicCastAttribute('test', caster)).toBe('[object Object]');
        });

        it('should cast to a number', () => {
            caster.mergeCasts({ 'test': 'number' });

            expect(caster.publicCastAttribute('test', '1')).toBe(1);
            expect(caster.publicCastAttribute('test', '-1')).toBe(-1);
            expect(caster.publicCastAttribute('test', '0.1')).toBe(0.1);

            const func = () => caster.publicCastAttribute('test', 'random value');
            expect(func).toThrow(new LogicException(
                '\'test\' is not castable to a number type in \'' + caster.constructor.name + '\'.'
            ));
        });

        it('should cast to a collection', () => {
            caster.mergeCasts({ test: 'collection' });

            expect(caster.publicCastAttribute('test', ['1'])).toStrictEqual(new Collection(['1']));

            const func = () => caster.publicCastAttribute('test', 'random value');
            expect(func)
                .toThrow(new LogicException(
                    '\'test\' is not castable to a collection type in \'' + caster.constructor.name + '\'.'
                ));
        });

        it('should set collection casted collection value to array on set to avoid wrapping on get', () => {
            caster.mergeCasts({ test: 'collection' });
            expect(caster.publicCastAttribute('test', new Collection([1, 2]), 'set')).toStrictEqual([1, 2]);
        });

        it('should throw error if value is not castable to collection', () => {
            caster.mergeCasts({ test: 'collection' });
            const failingFunc = jest.fn(() => caster.publicCastAttribute('test', 1, 'set'));

            expect(failingFunc).toThrow(new LogicException(
                '\'test\' is not castable to a collection type in \'' + CastingClass.name + '\'.'
            ));
        });

        it('should return the value untouched when using collection and it can be casted on get', () => {
            caster.mergeCasts({ test: 'collection' });
            expect(caster.publicCastAttribute('test', [1, 2], 'set')).toStrictEqual([1, 2]);
        });

        it('should cast to a datetime when cast set to datetime and Configuration set to function', () => {
            const now = new Date();
            advanceTo(now);
            caster.mergeCasts({ test: 'datetime' });
            config.set('datetime', dateTime);

            expect(caster.publicCastAttribute('test', now)).toBeInstanceOf(DateTime);
            expect((caster.publicCastAttribute('test', now) as DateTime).value()).toStrictEqual(now);
            config.unset('datetime');
        });

        it('should cast to a datetime when cast set to datetime and Configuration set to class', () => {
            const now = new Date();
            advanceTo(now);
            caster.mergeCasts({ test: 'datetime' });
            config.set('datetime', DateTime);


            expect(caster.publicCastAttribute('test', now)).toBeInstanceOf(DateTime);
            expect((caster.publicCastAttribute('test', now) as DateTime).value()).toStrictEqual(now);
            config.unset('datetime');
        });

        it('should throw an error if the datetime is not the expected type in the config', () => {
            caster.mergeCasts({ 'test': 'datetime' });
            const failingFunc = jest.fn(() => caster.publicCastAttribute('test', 'value'));
            config.unset('datetime');

            expect(failingFunc).toThrow(new InvalidArgumentException(
                '\'datetime\' is not of expected type or has not been set in the ' + config.constructor.name + '.'
            ));
        });

        it('should return the value untouched when using datetime on set', () => {
            caster.mergeCasts({ test: 'datetime' });
            config.set('datetime', DateTime);

            expect(caster.publicCastAttribute('test', 1, 'set')).toBe(1);

            config.unset('datetime');
        });

        it('should cast when using an object literal', () => {
            caster.mergeCasts({
                'test': {
                    get() {
                        return 'get value';
                    },
                    set() {}
                }
            });

            expect(caster.publicCastAttribute('test', '1')).toBe('get value');
        });

        it('should hit error if hasCast() and this.getCastType() are not in sync', () => {
            // @ts-expect-error
            caster.hasCast = () => true;
            const failingCall = () => caster.publicCastAttribute('test', '1');

            expect(failingCall).toThrow(new LogicException(
                'Impossible logic path reached. getCastType() returned unexpected value.'
            ));
        });
    });
});
