import * as func from '../../src/Support/function';
import { types } from '../test-helpers';

describe('function helpers', () => {
    describe('isObjectLiteral()', () => {
        const typesWithoutObjectLiteral = types.filter(t => !t
            || Object(t) !== t
            || t instanceof Function
            || Array.isArray(t)
        );

        it('should correctly evaluate if types are object literals', () => {
            typesWithoutObjectLiteral.forEach(type => {
                expect(func.isObjectLiteral(type)).toBe(false);
            });

            expect(func.isObjectLiteral({})).toBe(true);
        });
    });

    describe('isConstructableUserClass()', () => {
        const typesWithoutClass = types.filter(t => !/^\s*class\s+/.test(String(t)));
        // eslint-disable-next-line jest/require-hook
        typesWithoutClass.push('class MyClass {'); // see if it checks for more than just the toString()

        it('should correctly evaluate if types are user defined classes', () => {
            typesWithoutClass.forEach(type => {
                expect(func.isUserLandClass(type)).toBe(false);
            });

            // eslint-disable-next-line @typescript-eslint/no-extraneous-class
            expect(func.isUserLandClass(class C {})).toBe(true);
        });
    });

    describe('transformKeys()', () => {
        /* eslint-disable @typescript-eslint/naming-convention */
        it('should convert to camelCase by default', () => {
            const serverCasedObj = {
                start_date: 'Monday'
            };

            expect(func.transformKeys(serverCasedObj)).toStrictEqual({ startDate: 'Monday' });
        });

        it('should convert to snake_case on \'snake\' casing argument', () => {
            const serverCasedObj = {
                startDate: 'Monday'
            };

            expect(func.transformKeys(serverCasedObj, 'snake')).toStrictEqual({ start_date: 'Monday' });
        });

        it('should not transform prototype chain keys', () => {
            const object = {
                theProperty: 1,
                nestedConstructor: Object
            };

            const transformedObj = func.transformKeys(object, 'snake');
            expect(transformedObj.the_property).toBe(1);
            expect(transformedObj.theProperty).toBeUndefined();
            expect(transformedObj.nested_constructor).toStrictEqual(Object);
            expect(transformedObj.nestedConstructor).toBeUndefined();
            expect(transformedObj.nested_constructor.define_property).toBeUndefined();
            expect(transformedObj.nested_constructor.defineProperty).toBeDefined();
        });
        /* eslint-enable @typescript-eslint/naming-convention */
    });
});
