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
});
