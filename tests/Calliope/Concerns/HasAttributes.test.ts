import User from '../../mock/Models/User';
import Shift from '../../mock/Models/Shift';
import ModelCollection from '../../../src/Calliope/ModelCollection';
import { isEqual } from 'lodash';
import Contract from '../../mock/Models/Contract';

let hasAttributes: User;

describe('HasAttributes', () => {
    beforeEach(() => {
        hasAttributes = new User({ test: 1 });
    });

    describe('.attributeCasing', () => {
        it('should dictate how attribute keys are formatted', () => {
            // the formatting boils down to the forceFill method
            // eslint-disable-next-line @typescript-eslint/naming-convention
            hasAttributes = new User({ some_value: 1 });

            expect(hasAttributes.getAttribute('someValue')).toBe(1);
            expect(hasAttributes.getAttribute('some_value')).toBeUndefined();
        });

        it('should get the attributeCasing value from the extending model', () => {
            class UserWithSnakeCase extends User {
                public get attributeCasing() {
                    return 'snake' as const;
                }
            }

            const user = new UserWithSnakeCase({ someValue: 1 });

            expect(user.getAttribute('someValue')).toBeUndefined();
            expect(user.getAttribute('some_value')).toBe(1);
        });
    });

    describe('constructor()', () => {
        it('should set up mutators', () => {
            // when it has a mutator defined
            Object.defineProperty(hasAttributes, 'setTestAttribute', {
                value: function (value: number): void {
                    this.attributes.test = value + 1;
                }
            });

            hasAttributes.test = 1;
            expect(hasAttributes.test).toBe(2);
        });

        it('should set up accessors', () => {
            // when it has a accessor defined
            Object.defineProperty(hasAttributes, 'getTestAttribute', {
                value: function (): number {
                    return (this.attributes.test as number) + 1;
                }
            });

            expect(hasAttributes.test).toBe(2);
        });

        it('should set attributes with given argument', () => {
            expect(hasAttributes.getAttributes()).toStrictEqual({ test: 1 });
        });

        it('should sync the original values', () => {
            expect(hasAttributes.getAttributes()).toStrictEqual(hasAttributes.getOriginal());
        });

        it('should be able to take instance of itself and hydrate the relations and attributes', () => {
            expect(new User(hasAttributes).getOriginal())
                .toStrictEqual(hasAttributes.getAttributes());

            expect(new User(hasAttributes).getOriginal())
                .toStrictEqual(hasAttributes.getAttributes());
        });

        it('should not set object values by reference', () => {
            const attributes = {
                value: 1,
                level2: {
                    value: 1
                }
            };

            const user = new User(attributes);

            expect(user.getAttribute('value')).toBe(1);
            expect(user.getAttribute('level2')).toStrictEqual({ value: 1 });

            attributes.value++;
            attributes.level2.value++;

            expect(user.getAttribute('value')).toBe(1);
            expect(user.getAttribute('level2')).toStrictEqual({ value: 1 });
        });
    });

    describe('[Symbol.iterator]()', () => {
        it('should have the capability to be looped over', () => {
            let count = 0;

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for (const [_item] of hasAttributes) {
                count++;
            }

            expect(count).toBe(
                hasAttributes.getAttributeKeys().length + Object.keys(hasAttributes.getRelations()).length
            );
        });

        it('should return the expected elements', () => {
            let boolean = true;
            const values = Object.assign({}, hasAttributes.getAttributes(), hasAttributes.getRelations());
            const hasValue = (value: any) => {
                // flaky test given there could be multiple keys with the same value
                return Object.keys(values).filter(key => isEqual(values[key], value)).length > 0;
            };

            for (const [item] of hasAttributes) {
                boolean = boolean && hasValue(item);
            }

            expect(boolean).toBe(true);
        });

        it('should return the attributes first then the relations.', () => {
            hasAttributes.addRelation('shifts', [new Shift]);

            let relationWasLast = false;
            for (const [item] of hasAttributes) {
                // eslint-disable-next-line jest/no-if
                relationWasLast = item !== hasAttributes.test;
            }

            expect(relationWasLast).toBe(true);
        });

        it('should return deep copies', () => {
            hasAttributes.setAttribute('myAttr', { key: 1 });

            for (const [item, key] of hasAttributes) {
                // eslint-disable-next-line jest/no-if
                if (key === 'myAttr') {
                    item.key = 2;
                }
            }

            expect((hasAttributes.myAttr as { key: 1 }).key).toBe(1);
        });
    });

    describe('getAttribute()', () => {
        // test are in order of priority of how the value is determined
        it('should return value from accessor', () => {
            Object.defineProperty(hasAttributes, 'getTestAttribute', {
                value: function (): number {
                    return (this.attributes.test as number) + 1;
                }
            });

            expect(hasAttributes.getAttribute('test')).toBe(2);
        });

        it('should return value from the attributes', () => {
            expect(hasAttributes.getAttribute('test')).toBe(1);
        });

        it('should cast the attribute if cast is defined', () => {
            hasAttributes.mergeCasts({ test: 'boolean' });

            expect(hasAttributes.setAttribute('test', 1).getAttribute('test')).toBe(true);
        });

        it('should return the default value if the attribute is a method', () => {
            hasAttributes = new User();

            Object.defineProperty(hasAttributes, 'test', {
                value: function (): string {
                    return 'custom value';
                }
            });

            expect(hasAttributes.getAttribute('test', 'default value')).toBe('default value');
        });

        it('should return the relation if loaded', () => {
            hasAttributes.setAttribute('shifts', Shift.factory().times(2).create());

            expect(hasAttributes.getAttribute('shifts')).toBeInstanceOf(ModelCollection);
        });

        it('should return value from the class', () => {
            hasAttributes.randomKey = 'custom value';

            expect(hasAttributes.getAttribute('randomKey')).toBe('custom value');
        });

        it('should return the second argument if key not found otherwise undefined', () => {
            hasAttributes = new User();

            expect(hasAttributes.getAttribute('test', 'default value')).toBe('default value');

            expect(hasAttributes.getAttribute('test')).toBeUndefined();
        });
    });

    describe('getAttributes()', () => {
        it('should return the class attributes in a resolved format', () => {
            hasAttributes = new User({ test1: 1, test2: 2 });

            Object.defineProperty(hasAttributes, 'getTest1Attribute', {
                value: function (): number {
                    return (this.attributes.test1 as number) + 1;
                }
            });

            expect(hasAttributes.getAttributes()).toStrictEqual({ test1: 2, test2: 2 });
        });
    });

    describe('getRawAttributes()', () => {
        it('should return the class attributes without any transformation', () => {
            expect(hasAttributes.getRawAttributes()).toStrictEqual({ test: 1 });
        });
    });

    describe('getAttributeKeys()', () => {
        it('should return an array of strings that are the keys in the attributes', () =>{
            hasAttributes = new User({ test1: 1, test2: 2 });

            expect(hasAttributes.getAttributeKeys()).toStrictEqual(['test1', 'test2']);
        });
    });

    describe('setAttribute()', () => {
        it('should call the mutator if exists', () => {
            Object.defineProperty(hasAttributes, 'setTestAttribute', {
                value: function (value: number): void {
                    this.attributes.test = value + 1;
                }
            });

            expect(hasAttributes.setAttribute('test', 1).test).toBe(2);
        });

        it('should cast the value if caster set', () => {
            hasAttributes.mergeCasts({ test: 'number' });

            hasAttributes.setAttribute('test', '1.2');

            expect(hasAttributes.test).toBe(1.2);
        });

        it('should set the attribute value', () => {
            expect(hasAttributes.setAttribute('test', 1).getAttribute('test')).toBe(1);
        });

        it('should set the relation value if it\'s defined', () => {
            hasAttributes.setAttribute('shifts', Shift.factory().times(2).create());

            // @ts-expect-error
            expect(hasAttributes.relations.shifts).toBeDefined();
        });

        it('should return the class', () => {
            expect(hasAttributes.setAttribute('test', 1)).toBeInstanceOf(User);
        });

        it('should create an accessor', () => {
            hasAttributes.setAttribute('test', 1);

            expect(hasAttributes.test).toBe(1);
        });
    });

    describe('createDescriptor()', () => {
        it('should create accessors and getters for the given key', () => {
            // @ts-expect-error
            hasAttributes.createDescriptor('test');

            const descriptor = Object.getOwnPropertyDescriptor(hasAttributes, 'test');

            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(descriptor?.get).toBeDefined();
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(descriptor?.set).toBeDefined();
        });

        it('should create accessors and getters for multiple keys', () => {
            const keys = ['multiple', 'keys'];
            // @ts-expect-error
            hasAttributes.createDescriptor(keys);

            keys.forEach(key => {
                const descriptor = Object.getOwnPropertyDescriptor(hasAttributes, key);

                // eslint-disable-next-line @typescript-eslint/unbound-method
                expect(descriptor?.get).toBeDefined();
                // eslint-disable-next-line @typescript-eslint/unbound-method
                expect(descriptor?.set).toBeDefined();
            });
        });
    });

    describe('deleteAttribute()', () => {
        it('should delete the attribute and class property if defined', () => {
            expect(hasAttributes.test).toBe(1);
            expect(Object.getOwnPropertyDescriptor(hasAttributes, 'test')).toBeDefined();

            hasAttributes.deleteAttribute('test');

            expect(hasAttributes.test).toBeUndefined();
            expect(Object.getOwnPropertyDescriptor(hasAttributes, 'test')).toBeUndefined();
        });

        it('should remove the relation if loaded', () => {
            hasAttributes.addRelation('shifts', new Shift);

            expect(hasAttributes.relationLoaded('shifts')).toBe(true);
            expect(Object.getOwnPropertyDescriptor(hasAttributes, 'shifts')).toBeDefined();
            expect(hasAttributes.deleteAttribute('shifts').relationLoaded('shifts')).toBe(false);
            expect(Object.getOwnPropertyDescriptor(hasAttributes, 'shifts')).toBeUndefined();
        });

        it('should not remove methods from the model', () => {
            hasAttributes.myFunc = () => true;
            expect(hasAttributes.myFunc).toBeDefined();
            hasAttributes.deleteAttribute('myFunc');
            expect(hasAttributes.myFunc).toBeDefined();
        });

        it('should not remove the original value', () => {
            hasAttributes.deleteAttribute('test');

            expect(hasAttributes.test).toBeUndefined();
            expect(hasAttributes.getOriginal('test')).toBeDefined();
        });
    });

    describe('hasSetMutator()', () => {
        it('should determine whether a mutator exists for a given key', () => {
            // @ts-expect-error
            expect(hasAttributes.hasSetMutator('test')).toBe(false);

            Object.defineProperty(hasAttributes, 'setTestAttribute', {
                value: function (value: number): void {
                    this.attributes.test = value + 1;
                }
            });

            // @ts-expect-error
            expect(hasAttributes.hasSetMutator('test')).toBe(true);
        });
    });

    describe('hasGetAccessor()', () => {
        it('should determine whether an accessor exists for a given key', () => {
            // @ts-expect-error
            expect(hasAttributes.hasGetAccessor('test')).toBe(false);

            Object.defineProperty(hasAttributes, 'getTestAttribute', {
                value: function (): number {
                    return (this.attributes.test as number) + 1;
                }
            });

            // @ts-expect-error
            expect(hasAttributes.hasGetAccessor('test')).toBe(true);
        });
    });

    describe('fill()', () => {
        it('should add the attributes that are allowed to be added', () => {
            hasAttributes.setFillable(['test']);

            hasAttributes.fill({ test: 1, value: 2 });

            expect(hasAttributes.getAttribute('test')).toBe(1);
            expect(hasAttributes.getAttribute('value')).toBeUndefined();
        });
    });

    describe('forceFill()', () => {
        it('should add attributes regardless of guarding', () => {
            hasAttributes.setFillable([]);

            hasAttributes.forceFill({ test: 1, value: 2 });

            expect(hasAttributes.getAttribute('test')).toBe(1);
            expect(hasAttributes.getAttribute('value')).toBe(2);
        });
    });

    describe('syncOriginal()', () => {
        it('should set the original to the values from the attributes', () => {
            hasAttributes = new User();

            hasAttributes.fill({ test: 1 });

            expect(hasAttributes.getRawOriginal()).toStrictEqual({});

            expect(hasAttributes.syncOriginal().getRawOriginal()).toStrictEqual({ test: 1 });
        });

        it('should sync specified key only if defined', () => {
            hasAttributes = new User();

            hasAttributes.fill({ test: 1, test1: 2 });

            expect(hasAttributes.getRawOriginal()).toStrictEqual({});

            expect(hasAttributes.syncOriginal('test').getRawOriginal()).toStrictEqual({ test: 1 });
        });

        it('should sync specified keys only if defined', () => {
            hasAttributes = new User();

            hasAttributes.fill({ test: 1, test1: 2 });

            expect(hasAttributes.getRawOriginal()).toStrictEqual({});

            expect(hasAttributes.syncOriginal(['test', 'test1']).getRawOriginal()).toStrictEqual({ test: 1, test1: 2 });
        });

        it('should delete attributes that has been removed', () => {
            hasAttributes.deleteAttribute('test').syncOriginal();

            expect(hasAttributes.getOriginal('test')).toBeUndefined();
        });

        it('should delete attributes when key is specified and has been removed', () => {
            hasAttributes.deleteAttribute('test').syncOriginal('test');

            expect(hasAttributes.getOriginal('test')).toBeUndefined();
        });

        it('should not delete null and undefined', () => {
            hasAttributes.test = null;
            hasAttributes.syncOriginal();

            expect(hasAttributes.getOriginal('test')).toBeNull();

            hasAttributes.test = undefined;
            hasAttributes.syncOriginal();

            expect(hasAttributes.getOriginal('test')).toBeUndefined();
        });

        it('should not delete null and undefined when using an argument', () => {
            hasAttributes.test = null;
            hasAttributes.syncOriginal('test');

            expect(hasAttributes.getOriginal('test')).toBeNull();

            hasAttributes.test = undefined;
            hasAttributes.syncOriginal('test');

            expect(hasAttributes.getOriginal('test')).toBeUndefined();
        });
    });

    describe('reset()', () => {
        it('should set the attributes to the original', () => {
            hasAttributes = new User({ test: 1 });
            hasAttributes.test = 2;

            expect(hasAttributes.getAttribute('test')).toBe(2);

            expect(hasAttributes.reset().getAttribute('test')).toBe(1);
        });

        it('should use deep cloning', () => {
            hasAttributes = new User({ test: 1 });
            // @ts-expect-error
            hasAttributes.reset().original.test = 2;
            expect(hasAttributes.getAttribute('test')).not.toBe(2);
        });
    });

    describe('getOriginal()', () =>  {
        it('should get the original values from the attributes in a resolved format', () => {
            class UserWithAccessor extends User {
                public getTestAttribute() {
                    return 'accessed value';
                }
            }
            const userValueTransformator = new UserWithAccessor({ test: 1, test1: 1 });

            userValueTransformator.mergeCasts({ test1: 'boolean' });

            expect(userValueTransformator.getOriginal()).toStrictEqual({ test: 'accessed value', test1: true });
        });

        it('should get a single original value from the attributes in a resolved format', () => {
            class UserWithAccessor extends User {
                public getTestAttribute() {
                    return 'accessed value';
                }
            }
            const userValueTransformator = new UserWithAccessor({ test: 1, test1: 1 });

            userValueTransformator.mergeCasts({ test1: 'boolean' });

            expect(userValueTransformator.getOriginal('test')).toBe('accessed value');
            expect(userValueTransformator.getOriginal('test1')).toBe(true);
        });

        it('should return a default value if given key not set', () => {
            expect(hasAttributes.getOriginal('some key', 'default value')).toBe('default value');
        });
    });

    describe('getRawOriginal()', () => {
        it('should get the original values from the attributes', () => {
            expect(hasAttributes.getRawOriginal()).toStrictEqual({ test: 1 });
            expect(hasAttributes.deleteAttribute('test').syncOriginal().getRawOriginal()).toStrictEqual({});
        });

        it('should get a single original value from the attributes', () => {
            expect(hasAttributes.getRawOriginal('test')).toBe(1);
        });

        it('should return a default value if given and value not set', () => {
            expect(hasAttributes.getRawOriginal('some key', 'default value')).toBe('default value');
        });
    });

    describe('getChanges()', () => {
        it('should get the changes since last sync with original', () => {
            expect(hasAttributes.getChanges()).toStrictEqual({});
            expect(hasAttributes.setAttribute('test', 2).getChanges()).toStrictEqual({ test: 2 });
        });

        it('should get the changes for a single key', () => {
            expect(hasAttributes.setAttribute('test', 2).getChanges('test')).toStrictEqual({ test: 2 });
        });

        it('should return empty object if no changes detected for the given key', () => {
            expect(hasAttributes.setAttribute('test', 1).getChanges('test')).toStrictEqual({});
        });

        it('should return empty object if no changes detected', () => {
            expect(hasAttributes.getChanges()).toStrictEqual({});
        });
    });

    describe('getDeletedAttributes()', () => {
        it('should return the deleted attributes', () => {
            const test = hasAttributes.setAttribute('test2', 2).syncOriginal().getAttribute('test');

            expect(hasAttributes.deleteAttribute('test').getDeletedAttributes()).toStrictEqual({ test });
        });

        it('should return an object containing only the given key', () => {
            const test = hasAttributes.setAttribute('test2', 2).syncOriginal().getAttribute('test');

            expect(hasAttributes.deleteAttribute('test').getDeletedAttributes('test')).toStrictEqual({ test });
        });

        it('should return an empty object if no attributes have been deleted', () => {
            expect(hasAttributes.getDeletedAttributes()).toStrictEqual({});
        });

        it('should return an empty object if the attribute with the given key has not been deleted', () => {
            expect(hasAttributes.getDeletedAttributes('test')).toStrictEqual({});
        });

        it('should return an empty object if the given key has not been set in the original', () => {
            expect(hasAttributes.getDeletedAttributes('test1')).toStrictEqual({});
        });
    });

    describe('getNewAttributes()', () => {
        it('should return the new attributes if any', () => {
            expect(hasAttributes.setAttribute('test1', 1).getNewAttributes()).toStrictEqual({ test1: 1 });
        });

        it('should return an object containing only the given key', () => {
            expect(
                hasAttributes.setAttribute('test1', 1).setAttribute('test2', 2).getNewAttributes('test1')
            ).toStrictEqual({ test1: 1 });
        });

        it('should return an empty object if no new attributes have been added', () => {
            expect(hasAttributes.getNewAttributes()).toStrictEqual({});
        });

        it('should return an empty object if the attribute with the given key is not new', () => {
            expect(hasAttributes.getNewAttributes('test')).toStrictEqual({});
        });

        it('should return an empty object if the given key has not been set in the attributes', () => {
            expect(hasAttributes.getNewAttributes('test1')).toStrictEqual({});
        });
    });

    describe('hasChanges()', () => {
        it('should determine if any changes has been made', () => {
            hasAttributes = new User({ test: 1, value: 2 });

            expect(hasAttributes.setAttribute('test', 2).hasChanges()).toBe(true);
        });

        it('should determine if a given key has changed', () => {
            hasAttributes = new User({ test: 1, value: 2 });

            expect(hasAttributes.setAttribute('test', 2).hasChanges('test')).toBe(true);
            expect(hasAttributes.hasChanges('value')).toBe(false);
        });

        it('should consider new attributes', () => {
            expect(hasAttributes.setAttribute('test1', 1).hasChanges()).toBe(true);
            expect(hasAttributes.setAttribute('test1', 1).hasChanges('test1')).toBe(true);
        });

        it('should consider deleted attributes', () => {
            expect(hasAttributes.deleteAttribute('test').hasChanges()).toBe(true);
            expect(hasAttributes.deleteAttribute('test').hasChanges('test')).toBe(true);
        });
    });

    describe('isDirty()', () => {
        // isDirty an alias of hasChanges
        it('should determine if any changes has been made', () => {
            hasAttributes = new User({ test: 1, value: 2 });

            expect(hasAttributes.setAttribute('test', 2).isDirty()).toBe(true);
        });

        it('should determine if a given key has changed', () => {
            hasAttributes = new User({ test: 1, value: 2 });

            expect(hasAttributes.setAttribute('test', 2).isDirty('test')).toBe(true);
            expect(hasAttributes.isDirty('value')).toBe(false);
        });
    });

    describe('isClean()', () => {
        it('should determine if any changes has been made', () => {
            hasAttributes = new User({ test: 1, value: 2 });

            expect(hasAttributes.setAttribute('test', 2).isClean()).toBe(false);
        });

        it('should determine if a given key has changed', () => {
            hasAttributes = new User({ test: 1, value: 2 });

            expect(hasAttributes.setAttribute('test', 2).isClean('test')).toBe(false);
            expect(hasAttributes.isClean('value')).toBe(true);
        });
    });

    describe('only()', () => {
        it('should return only the specified attributes', () => {
            hasAttributes = new User({ test: 1, value: 2 });

            expect(hasAttributes.only('test')).toStrictEqual({ test: 1 });
            expect(hasAttributes.only(['test'])).toStrictEqual({ test: 1 });
        });
    });

    describe('except()', () => {
        it('should return all the attributes except the specified ones', () => {
            hasAttributes = new User({ test: 1, value: 2 });

            expect(hasAttributes.except(['test'])).toStrictEqual({ value: 2 });
        });
    });

    describe('toJSON()', () => {
        it('should jsonify the attributes', () => {
            expect(hasAttributes.toJSON()).toStrictEqual({
                test: hasAttributes.getAttribute('test')
            });
        });

        it('should recursively jsonify the relations', () => {
            const shift = new Shift();
            shift.setAttribute('shiftAttr', 1);
            hasAttributes.addRelation('shifts', shift);

            expect(hasAttributes.toJSON()).toStrictEqual({
                test: 1,
                shifts: [
                    { shiftAttr: 1 }
                ]
            });
        });
    });

    describe('toString()', () => {
        it('should return a json with spacing', () => {
            hasAttributes = User.factory<User>()
                .with(Shift.factory(2))
                .with(Contract)
                .createOne({ key1: 1, key2: 2 });

            expect(hasAttributes.toString()).toBe(JSON.stringify(hasAttributes.toJSON(), null, 4));
        });
    });
});
