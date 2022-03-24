import Collection from '../../../src/Support/Collection';
import { config, now } from '../../setupTests';
import User from '../../mock/Models/User';
import { DateTime, dateTime } from '../../mock/Configuration/DateTime';
import InvalidArgumentException from '../../../src/Exceptions/InvalidArgumentException';
import type AttributeCaster from '../../../src/Contracts/AttributeCaster';
import LogicException from '../../../src/Exceptions/LogicException';

class CastingClass extends User {
    public override getName(): string {
        return 'CastingClass';
    }

    public getCasts() {
        return this.attributeCasts;
    }

    public publicCastAttribute(
        key: string,
        value: any,
        method: keyof AttributeCaster = 'get'
    ): unknown {
        return this.castAttribute(key, value, method);
    }
}

let caster: CastingClass;

describe('CastsAttributes', () => {
    beforeEach(() => {
        caster = new CastingClass;
    });

    describe('constructor()', () => {
        it('should merge the getter into the internal casts', () => {
            class CastingClassWithGetter extends CastingClass {
                public override get casts() {
                    return {
                        test: 'boolean' as const
                    };
                }
            }

            const withGetter = new CastingClassWithGetter();

            expect(withGetter.hasCast('test')).toBe(true);
        });
    });

    describe('mergeCasts()', () => {
        it('should merge the casts property with existing casts', () => {
            expect(caster.getCasts()).toStrictEqual({});

            caster.mergeCasts({ test: 'boolean' });
            expect(caster.getCasts()).toStrictEqual({ test: 'boolean' });

            caster.mergeCasts({ thing: 'number' });
            expect(caster.getCasts()).toStrictEqual({ test: 'boolean', thing: 'number' });
        });
    });

    describe('hasCast()', () => {
        it('should determine correctly whether a cast exists or not', () => {
            expect(caster.hasCast('test')).toBe(false);

            caster.mergeCasts({ test: 'boolean' });

            expect(caster.hasCast('test')).toBe(true);
        });
    });

    describe('setCasts()', () => {
        it('should replace the casts for the model', () => {
            expect(caster.getCasts()).toStrictEqual({});
            expect(caster.setCasts({ test: 'boolean' }).getCasts()).toStrictEqual({ test: 'boolean' });
        });
    });

    describe('castAttribute()', () => {
        it('should return the original value if no cast is defined', () => {
            expect(caster.publicCastAttribute('test', '1')).toBe('1');
        });

        it('should cast to a boolean', () => {
            caster.mergeCasts({ test: 'boolean' });

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
            caster.mergeCasts({ test: 'string' });
            const transformsToString = {
                toString() {
                    return 'value';
                }
            };

            expect(caster.publicCastAttribute('test', 1)).toBe('1');
            expect(caster.publicCastAttribute('test', undefined)).toBe('undefined');
            expect(caster.publicCastAttribute('test', false)).toBe('false');
            // calls the toString method
            expect(caster.publicCastAttribute('test', {})).toBe('[object Object]');
            expect(caster.publicCastAttribute('test', transformsToString)).toBe('value');
        });

        it('should cast to a number', () => {
            caster.mergeCasts({ test: 'number' });

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

            expect(caster.publicCastAttribute('test', 'random value')).toStrictEqual(new Collection('random value'));
        });

        it('should set collection cast collection value to array on set to avoid wrapping on get', () => {
            caster.mergeCasts({ test: 'collection' });
            expect(caster.publicCastAttribute('test', new Collection([1, 2]), 'set')).toStrictEqual([1, 2]);
        });

        it('should return the value untouched when using collection and it can be cast on get', () => {
            caster.mergeCasts({ test: 'collection' });
            expect(caster.publicCastAttribute('test', [1, 2], 'set')).toStrictEqual([1, 2]);
        });

        it('should cast to a datetime when cast set to datetime and Configuration set to function', () => {
            caster.mergeCasts({ test: 'datetime' });
            config.set('datetime', dateTime);

            expect(caster.publicCastAttribute('test', now)).toBeInstanceOf(DateTime);
            expect((caster.publicCastAttribute('test', now) as DateTime).value()).toStrictEqual(now);
            config.unset('datetime');
        });

        it('should cast to a Date by default', () => {
            caster.mergeCasts({ test: 'datetime' });

            // it seems the ClockDate coming from @sinon/fake-timers doesn't have the same prototype
            expect(caster.publicCastAttribute('test', now.getTime())).toBeInstanceOf(now.constructor);
            expect(
                (caster.publicCastAttribute('test', now.getTime()) as Date).toUTCString()
            ).toStrictEqual(now.toUTCString());
        });

        it('should cast to a datetime when cast set to datetime and Configuration set to class', () => {
            caster.mergeCasts({ test: 'datetime' });
            config.set('datetime', DateTime);

            expect(caster.publicCastAttribute('test', now)).toBeInstanceOf(DateTime);
            expect((caster.publicCastAttribute('test', now) as DateTime).value()).toStrictEqual(now);
            config.unset('datetime');
        });

        it('should throw an error if the datetime is not the expected type in the config', () => {
            caster.mergeCasts({ test: 'datetime' });
            const failingFunc = jest.fn(() => caster.publicCastAttribute('test', 'value'));
            config.set('datetime', undefined);

            expect(failingFunc).toThrow(new InvalidArgumentException(
                '\'datetime\' is not of expected type set in the ' + config.constructor.name + '.'
            ));
            config.unset('datetime');
        });

        it('should throw an error if the value cannot be cast to a Date when no datetime defined', () => {
            caster.mergeCasts({ test: 'datetime' });
            expect(() => caster.publicCastAttribute('test', 'invalid value')).toThrow(
                new LogicException(
                    '\'test\' is not castable to a date time in \'' + caster.getName() + '\'.'
                )
            );
        });

        it('should return the value untouched when using datetime on set', () => {
            caster.mergeCasts({ test: 'datetime' });
            config.set('datetime', DateTime);

            expect(caster.publicCastAttribute('test', 1, 'set')).toBe(1);

            config.unset('datetime');
        });

        it('should cast when using an object literal', () => {
            caster.mergeCasts({
                test: {
                    get() {
                        return 'get value';
                    },
                    set() {
                        return 'set value';
                    }
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
