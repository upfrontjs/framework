import * as func from '../../src/Support/function';
import { types } from '../test-helpers';
import User from '../mock/Models/User';
import Team from '../mock/Models/Team';
import Shift from '../mock/Models/Shift';

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

    describe('isUserLandClass()', () => {
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

        it('should convert nested array of objects\' keys', () => {
            let snakeCasedObj = {
                sub_objects: [
                    {
                        my_key: 'value'
                    }
                ]
            } as Record<string, any>;

            const camelCasedObj = func.transformKeys(snakeCasedObj);

            expect(camelCasedObj).toStrictEqual({ subObjects: [{ myKey: 'value' }] });

            camelCasedObj.subObjects.push([]);
            camelCasedObj.subObjects.push(new User());
            snakeCasedObj = func.transformKeys(camelCasedObj, 'snake');

            // doesn't transform built in construct
            expect(snakeCasedObj.sub_objects[1].findIndex).toBeDefined();
            expect(snakeCasedObj.sub_objects[1].find_index).toBeUndefined();

            // doesn't transform upfront model
            expect(snakeCasedObj.sub_objects[2].get_endpoint).toBeUndefined();
            expect(snakeCasedObj.sub_objects[2].getEndpoint).toBeDefined();
            expect(snakeCasedObj.sub_objects[2].attribute_casing).toBeUndefined();
            expect(snakeCasedObj.sub_objects[2].getEndpoint).toBeDefined();
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

    describe('retry()', () => {
        // eslint-disable-next-line jest/require-hook
        let triesCount = 0;

        /**
         * Function resolving on last try
         * @param attemptToResolveOn
         */
        const tryFunc = async (attemptToResolveOn: number) => {
            triesCount++;

            // eslint-disable-next-line jest/no-conditional-in-test
            if (triesCount !== attemptToResolveOn) {
                throw new Error('Error');
            }

            return Promise.resolve('Success');
        };

        beforeEach(() => {
            triesCount = 0;
        });

        it('should retry the given number of times', async () => {
            await func.retry(async () => tryFunc(4), 3);

            expect(triesCount).toBe(4);
        });

        it('should return the value as soon as it resolves', async () => {
            const result = await func.retry(async () => tryFunc(2), 3);

            expect(triesCount).toBe(2);
            expect(result).toBe('Success');
        });

        it('should wait the the given number of ms before the next attempt', async () => {
            // on node@16 on some architectures (?) it's possible that the runtime is marginally less than 20ms
            // when using real timers, not sure why...
            jest.useFakeTimers({ advanceTimers: 5 });
            const startTime = performance.now();
            await func.retry(async () => tryFunc(3), 3, 10);

            // or grater because the time it takes to run the function
            expect(performance.now() - startTime).toBeGreaterThanOrEqual(20);

            jest.useFakeTimers();
        });

        it('should accept a closure for timeout and should pass the attempt number to it', async () => {
            jest.useRealTimers();
            const mock = jest.fn(() => 10);

            await func.retry(async () => tryFunc(3), 3, mock);
            expect(mock).toHaveBeenCalledTimes(2);
            expect(mock).toHaveBeenNthCalledWith(1, 1);
            expect(mock).toHaveBeenNthCalledWith(2, 2);

            jest.useFakeTimers();
        });
    });

    describe('dataGet()', () => {
        it('should handle arrays', () => {
            expect(func.dataGet(['a', 'b', 'c'], '1')).toBe('b');
        });

        it('should handle objects', () => {
            const obj = {
                key: 'value'
            };

            expect(func.dataGet(obj, 'key')).toBe('value');
        });

        it('should handle complex structures', () => {
            const complexStructure = Team.factory().with(
                User.factory().with(Shift.factory().attributes({ id: 1 }))
            ).makeMany();

            expect(func.dataGet(complexStructure, '0.users.0.shifts.0.id')).toBe(1);
        });
    });
});
