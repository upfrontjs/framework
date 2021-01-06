import User from '../../mock/Models/User';
import Shift from '../../mock/Models/Shift';
import ModelCollection from '../../../src/Calliope/ModelCollection';

let hasAttributes: User;

describe('hasAttributes', () => {
    beforeEach(() => {
        hasAttributes = new User({ test: 1 });
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
            expect(hasAttributes.getAttributes()).toStrictEqual({ 'test': 1 });
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

        it('should set the attribute value', () => {
            expect(hasAttributes.setAttribute('test', 1).getAttribute('test')).toBe(1);
        });

        it('should set the relation value if it\'s defined', () => {
            hasAttributes.setAttribute('shifts', Shift.factory().times(2).create());

            // @ts-expect-error
            expect(hasAttributes.relations.shifts).not.toBeUndefined();
        });

        it('should return the class', () => {
            expect(hasAttributes.setAttribute('test', 1)).toBeInstanceOf(User);
        });

        it('creates the accessor', () => {
            hasAttributes.setAttribute('test', 1);

            expect(hasAttributes.test).toBe(1);
        });
    });

    describe('createDescriptors()', () => {
        it('should create accessors and getters for the given key', () => {
            // @ts-expect-error
            hasAttributes.createDescriptors('test');

            const descriptor = Object.getOwnPropertyDescriptor(hasAttributes, 'test');

            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(descriptor?.get).not.toBeUndefined();
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(descriptor?.set).not.toBeUndefined();
        });

        it('should create accessors and getters for multiple keys', () => {
            const keys = ['multiple', 'keys'];
            // @ts-expect-error
            hasAttributes.createDescriptors(keys);

            keys.forEach(key => {
                const descriptor = Object.getOwnPropertyDescriptor(hasAttributes, key);

                // eslint-disable-next-line @typescript-eslint/unbound-method
                expect(descriptor?.get).not.toBeUndefined();
                // eslint-disable-next-line @typescript-eslint/unbound-method
                expect(descriptor?.set).not.toBeUndefined();
            });
        });
    });

    describe('deleteAttribute()', () => {
        it('should delete the attribute and class property if defined', () => {
            expect(hasAttributes.test).toBe(1);
            expect(Object.getOwnPropertyDescriptor(hasAttributes, 'test')).not.toBeUndefined();

            hasAttributes.deleteAttribute('test');

            expect(hasAttributes.test).toBeUndefined();
            expect(Object.getOwnPropertyDescriptor(hasAttributes, 'test')).toBeUndefined();
        });

        it('should not remove the original value', () => {
            hasAttributes.deleteAttribute('test');

            expect(hasAttributes.test).toBeUndefined();
            expect(hasAttributes.getOriginal('test')).not.toBeUndefined();
        });
    });

    describe('hasSetMutator()', () => {
        it('should determine whether a mutator exists for a given key', () => {
            expect(hasAttributes.hasSetMutator('test')).toBe(false);

            Object.defineProperty(hasAttributes, 'setTestAttribute', {
                value: function (value: number): void {
                    this.attributes.test = value + 1;
                }
            });

            expect(hasAttributes.hasSetMutator('test')).toBe(true);
        });
    });

    describe('hasGetAccessor()', () => {
        it('should determine whether an accessor exists for a given key', () => {
            expect(hasAttributes.hasGetAccessor('test')).toBe(false);

            Object.defineProperty(hasAttributes, 'getTestAttribute', {
                value: function (): number {
                    return (this.attributes.test as number) + 1;
                }
            });

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

            expect(hasAttributes.getRawOriginal()).toBeUndefined();

            expect(hasAttributes.syncOriginal().getRawOriginal()).toStrictEqual({ test: 1 });
        });

        it('should sync specified key only if defined', () => {
            hasAttributes = new User();

            hasAttributes.fill({ test: 1, test1: 2 });

            expect(hasAttributes.getRawOriginal()).toBeUndefined();

            expect(hasAttributes.syncOriginal('test').getRawOriginal()).toStrictEqual({ test: 1 });
        });

        it('should sync specified keys only if defined', () => {
            hasAttributes = new User();

            hasAttributes.fill({ test: 1, test1: 2 });

            expect(hasAttributes.getRawOriginal()).toBeUndefined();

            expect(hasAttributes.syncOriginal(['test', 'test1']).getRawOriginal()).toStrictEqual({ test: 1, test1: 2 });
        });

        it('should delete attributes that has been removed', () => {
            hasAttributes.deleteAttribute('test').syncOriginal();

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
        it('should set the original to the values from the attributes', () => {
            hasAttributes = new User();

            hasAttributes.fill({ test: 1 });

            expect(hasAttributes.getRawOriginal()).toBeUndefined();

            expect(hasAttributes.reset().getRawOriginal()).toStrictEqual({ test: 1 });
        });
    });

    describe('getOriginal()', () =>  {
        it('should get the original values from the attributes in a resolved format', () => {
            hasAttributes.mergeCasts({ test: 'boolean' });

            expect(hasAttributes.getOriginal()).toStrictEqual({ test: true });
        });

        it('should get a single original value from the attributes in a resolved format', () => {
            hasAttributes.mergeCasts({ test: 'boolean' });

            expect(hasAttributes.getOriginal('test')).toBe(true);
        });

        it('should return a default value if given and value not set', () => {
            expect(hasAttributes.getOriginal('some key', 'default value')).toBe('default value');
        });

        it('should return the default value if original value doesn\'t exits', () => {
            hasAttributes.getAttributeKeys().forEach(key => {
                hasAttributes.deleteAttribute(key);
            });

            expect(hasAttributes.syncOriginal().getOriginal('test', 'default value')).toBe('default value');
        });
    });

    describe('getRawOriginal()', () => {
        it('should get the original values from the attributes', () => {
            expect(hasAttributes.getRawOriginal()).toStrictEqual({ test: 1 });
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
            expect(hasAttributes.getChanges()).toBeNull();
            expect(hasAttributes.setAttribute('test', 2).getChanges()).toStrictEqual({ test: 2 });
        });

        it('should get the changes for a single key', () => {
            expect(hasAttributes.setAttribute('test', 2).getChanges('test')).toStrictEqual({ test: 2 });
        });

        it('should return null if no changes detected for the given key', () => {
            expect(hasAttributes.setAttribute('test', 1).getChanges('test')).toBeNull();
        });

        it('should return null if no changes detected', () => {
            expect(hasAttributes.getChanges()).toBeNull();
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

            expect(hasAttributes.only(['test'])).toStrictEqual({ test: 1 });
        });
    });

    describe('except()', () => {
        it('should return all the attributes except the specified ones', () => {
            hasAttributes = new User({ test: 1, value: 2 });

            expect(hasAttributes.except(['test'])).toStrictEqual({ value: 2 });
        });
    });

    describe('toJson()', () => {
        it('should stringify the attributes and relations', () => {
            expect(hasAttributes.toJson()).toStrictEqual(JSON.stringify({
                test: hasAttributes.getAttribute('test')
            }));
        });
    });
});
