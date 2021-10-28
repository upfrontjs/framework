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

        it('should correctly evaluate if types are user defined classes', () => {
            typesWithoutClass.forEach(type => {
                expect(func.isConstructableUserClass(type)).toBe(false);
            });

            // eslint-disable-next-line @typescript-eslint/no-extraneous-class
            expect(func.isConstructableUserClass(class C {})).toBe(true);
        });
    });
});
