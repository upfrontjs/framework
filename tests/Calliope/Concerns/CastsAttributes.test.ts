import CastsAttributes from '../../../src/Calliope/Concerns/CastsAttributes';
import Collection from '../../../src/Support/Collection';
import type DateTimeInterface from '../../../src/Contracts/DateTimeInterface';

class CastingClass extends CastsAttributes {
    public getCasts() {
        return this.casts;
    }

    public getValue(key: string, value: any) {
        return this.castAttribute(key, value);
    }
}

let caster: CastingClass;

describe('castsAttributes', () => {
    beforeEach(() => {
        caster = new CastingClass();
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
            expect(caster.getValue('test', '1')).toBe('1');
        });

        it('should cast to a boolean', () => {
            caster.mergeCasts({ 'test': 'boolean' });

            expect(caster.getValue('test', '1')).toBe(true);
            expect(caster.getValue('test', 1)).toBe(true);
            expect(caster.getValue('test', 'true')).toBe(true);

            expect(caster.getValue('test', '0')).toBe(false);
            expect(caster.getValue('test', 0)).toBe(false);
            expect(caster.getValue('test', 'false')).toBe(false);

            const func = () => caster.getValue('test', 'random value');
            expect(func).toThrow('\'test\' is not castable to a boolean type in \'' + caster.constructor.name + '\'.');
        });

        it('should cast to a string', () => {
            caster.mergeCasts({ 'test': 'string' });

            expect(caster.getValue('test', 1)).toBe('1');
            expect(caster.getValue('test', undefined)).toBe('undefined');
            expect(caster.getValue('test', false)).toBe('false');
            expect(caster.getValue('test', caster)).toBe('[object Object]'); //calls the to primitive string method
        });

        it('should cast to a number', () => {
            caster.mergeCasts({ 'test': 'number' });

            expect(caster.getValue('test', '1')).toBe(1);
            expect(caster.getValue('test', '-1')).toBe(-1);
            expect(caster.getValue('test', '0.1')).toBe(0.1);

            const func = () => caster.getValue('test', 'random value');
            expect(func).toThrow('\'test\' is not castable to a number type in \'' + caster.constructor.name + '\'.');
        });

        it('should cast to a collection', () => {
            caster.mergeCasts({ 'test': 'collection' });

            expect(caster.getValue('test', ['1'])).toStrictEqual(new Collection(['1']));

            const func = () => caster.getValue('test', 'random value');
            expect(func)
                .toThrow('\'test\' is not castable to a collection type in \'' + caster.constructor.name + '\'.');
        });

        it('should cast to a dateTime', () => {
            class DateTime implements DateTimeInterface {
                parse(): DateTimeInterface {
                    return this;
                }
                value = 'object value';
            }

            caster.mergeCasts({ test: new DateTime() });

            expect((caster.getValue('test', 1) as DateTime).value).toBe('object value');
        });

        it('should cast using a custom object', () => {
            caster.mergeCasts({
                'test': {
                    get() {
                        return 'get value';
                    },
                    set() {
                        return 'set value';
                    }
                }
            });

            expect(caster.getValue('test', '1')).toBe('get value');
        });

        it('should hit error if hasCast() and this.getCastType() are not in sync', () => {
            // @ts-expect-error
            caster.hasCast = () => true;
            const failingCall = () => caster.getValue('test', '1');

            expect(failingCall).toThrow('Impossible logic path reached. hasCast() ' +
                'and getCastType() implementations are not in sync.');
        });
    });
});
