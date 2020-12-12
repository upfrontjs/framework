import HasAttributes from '../../../src/Calliope/Concerns/HasAttributes';

class AttributableClass extends HasAttributes {
    protected initialise(): { guarded?: string[]; fillable?: string[] } {
        return {
            fillable: ['*']
        };
    }
    public relationLoaded() {
        return false;
    }

    public relationDefined() {
        return false;
    }
}

let attributable: AttributableClass;

describe('hasAttributes', () => {
    describe('constructor()', () => {
        beforeEach(() => {
            attributable = new AttributableClass({ test: 1 });
        });

        it('should set up mutators', () => {
            // when it has a mutator defined
            Object.defineProperty(attributable, 'setTestAttribute', {
                value: function (value: number): void {
                    this.attributes.test = value + 1;
                }
            });

            attributable.test = 1;
            expect(attributable.test).toBe(2);
        });

        it('should set up accessors', () => {
            // when it has a accessor defined
            Object.defineProperty(attributable, 'getTestAttribute', {
                value: function (): number {
                    return (this.attributes.test as number) + 1;
                }
            });

            expect(attributable.test).toBe(2);
        });

        it('should set attributes with given argument', () => {
            expect(attributable.getAttributes()).toStrictEqual({ 'test': 1 });
        });
    });

    describe('getAttribute()', () => {
        // test are in order of priority of how the value is determined
        it('should return value from accessor', () => {
            attributable = new AttributableClass({ test: 1 });

            Object.defineProperty(attributable, 'getTestAttribute', {
                value: function (): number {
                    return (this.attributes.test as number) + 1;
                }
            });

            expect(attributable.getAttribute('test')).toBe(2);
        });

        it('should return value from the attributes', () => {
            attributable = new AttributableClass({ test: 1 });

            expect(attributable.getAttribute('test')).toBe(1);
        });

        it('should return the default value if the attribute is a method', () => {
            attributable = new AttributableClass();

            Object.defineProperty(attributable, 'test', {
                value: function (): string {
                    return 'custom value';
                }
            });

            expect(attributable.getAttribute('test', 'default value')).toBe('default value');
        });

        it('should return value from the class', () => {
            attributable = new AttributableClass();
            attributable.test = 'custom value';

            expect(attributable.getAttribute('test')).toBe('custom value');
        });

        it('should return the second argument if key not found otherwise undefined', () => {
            attributable = new AttributableClass();

            expect(attributable.getAttribute('test', 'default value')).toBe('default value');

            expect(attributable.getAttribute('test')).toBeUndefined();
        });
    });

    describe('getAttributes()', () => {
        it('should return the class attributes in a resolved format', () => {
            attributable = new AttributableClass({ test1: 1, test2: 2 });

            Object.defineProperty(attributable, 'getTest1Attribute', {
                value: function (): number {
                    return (this.attributes.test1 as number) + 1;
                }
            });

            expect(attributable.getAttributes()).toStrictEqual({ test1: 2, test2: 2 });
        });
    });

    describe('getAttributeKeys()', () => {
        it('should return an array of strings that are the keys in the attributes', () =>{
            attributable = new AttributableClass({ test1: 1, test2: 2 });

            expect(attributable.getAttributeKeys()).toStrictEqual(['test1', 'test2']);
        });
    });

    describe('setAttribute()', () => {
        it('should call the mutator if exists', () => {
            attributable = new AttributableClass({ test: 1 });

            Object.defineProperty(attributable, 'setTestAttribute', {
                value: function (value: number): void {
                    this.attributes.test = value + 1;
                }
            });

            expect(attributable.setAttribute('test', 1).test).toBe(2);
        });

        it('should set the attribute value', () => {
            attributable = new AttributableClass();

            expect(attributable.setAttribute('test', 1).getAttribute('test')).toBe(1);
        });

        it('should cast the attribute if cast is defined', () => {
            attributable = new AttributableClass();

            attributable.mergeCasts({ test: 'boolean' });

            expect(attributable.setAttribute('test', 1).getAttribute('test')).toBe(true);
        });

        it('should return the class', () => {
            attributable = new AttributableClass();

            expect(attributable.setAttribute('test', 1)).toBeInstanceOf(AttributableClass);
        });

        it('creates the accessor', () => {
            attributable = new AttributableClass();
            attributable.setAttribute('test', 1);

            expect(attributable.test).toBe(1);
        });
    });

    describe('createDescriptors()', () => {
        it('should create accessors and getters for the given key', () => {
            attributable = new AttributableClass();

            // @ts-expect-error
            attributable.createDescriptors('test');

            const descriptor = Object.getOwnPropertyDescriptor(attributable, 'test');

            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(descriptor?.get).not.toBeUndefined();
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(descriptor?.set).not.toBeUndefined();
        });

        it('should create accessors and getters for multiple keys', () => {
            attributable = new AttributableClass();

            const keys = ['multiple', 'keys'];
            // @ts-expect-error
            attributable.createDescriptors(keys);

            keys.forEach(key => {
                const descriptor = Object.getOwnPropertyDescriptor(attributable, key);

                // eslint-disable-next-line @typescript-eslint/unbound-method
                expect(descriptor?.get).not.toBeUndefined();
                // eslint-disable-next-line @typescript-eslint/unbound-method
                expect(descriptor?.set).not.toBeUndefined();
            });
        });
    });

    describe('deleteAttribute()', () => {
        it('should delete the attribute and class property if defined', () => {
            attributable = new AttributableClass({ test: 1 });

            expect(attributable.test).toBe(1);
            expect(Object.getOwnPropertyDescriptor(attributable, 'test')).not.toBeUndefined();

            attributable.deleteAttribute('test');

            expect(attributable.test).toBeUndefined();
            expect(Object.getOwnPropertyDescriptor(attributable, 'test')).toBeUndefined();
        });
    });

    describe('hasSetMutator()', () => {
        it('should determine whether a mutator exists for a given key', () => {
            attributable = new AttributableClass({ test: 1 });

            expect(attributable.hasSetMutator('test')).toBe(false);

            Object.defineProperty(attributable, 'setTestAttribute', {
                value: function (value: number): void {
                    this.attributes.test = value + 1;
                }
            });

            expect(attributable.hasSetMutator('test')).toBe(true);
        });
    });

    describe('hasGetAccessor()', () => {
        it('should determine whether an accessor exists for a given key', () => {
            attributable = new AttributableClass({ test: 1 });

            expect(attributable.hasGetAccessor('test')).toBe(false);

            Object.defineProperty(attributable, 'getTestAttribute', {
                value: function (): number {
                    return (this.attributes.test as number) + 1;
                }
            });

            expect(attributable.hasGetAccessor('test')).toBe(true);
        });
    });

    describe('fill()', () => {
        it('should add the attributes that are allowed to be added', () => {
            attributable = new AttributableClass();

            attributable.setFillable(['test']);

            attributable.fill({ test: 1, value: 2 });

            expect(attributable.getAttribute('test')).toBe(1);
            expect(attributable.getAttribute('value')).toBeUndefined();
        });
    });

    describe('forceFill()', () => {
        it('should add attributes regardless of guarding', () => {
            attributable = new AttributableClass();

            attributable.setFillable([]);

            attributable.forceFill({ test: 1, value: 2 });

            expect(attributable.getAttribute('test')).toBe(1);
            expect(attributable.getAttribute('value')).toBe(2);
        });
    });

    describe('syncOriginal()', () => {
        it('should set the original to the values from the attributes', () => {
            attributable = new AttributableClass();

            attributable.fill({ test: 1 });

            expect(attributable.getRawOriginal()).toBeUndefined();

            expect(attributable.syncOriginal().getRawOriginal()).toStrictEqual({ test: 1 });
        });

        it('should sync specified key only if defined', () => {
            attributable = new AttributableClass();

            attributable.fill({ test: 1, test1: 2 });

            expect(attributable.getRawOriginal()).toBeUndefined();

            expect(attributable.syncOriginal('test').getRawOriginal()).toStrictEqual({ test: 1 });
        });

        it('should sync specified keys only if defined', () => {
            attributable = new AttributableClass();

            attributable.fill({ test: 1, test1: 2 });

            expect(attributable.getRawOriginal()).toBeUndefined();

            expect(attributable.syncOriginal(['test', 'test1']).getRawOriginal()).toStrictEqual({ test: 1, test1: 2 });
        });
    });

    describe('reset()', () => {
        it('should set the original to the values from the attributes', () => {
            attributable = new AttributableClass();

            attributable.fill({ test: 1 });

            expect(attributable.getRawOriginal()).toBeUndefined();

            expect(attributable.reset().getRawOriginal()).toStrictEqual({ test: 1 });
        });
    });

    describe('getOriginal()', () =>  {
        it('should get the original values from the attributes in a resolved format', () => {
            attributable = new AttributableClass({ test: 1 });

            attributable.mergeCasts({ test: 'boolean' });

            expect(attributable.getOriginal()).toStrictEqual({ test: true });
        });

        it('should get a single original value from the attributes in a resolved format', () => {
            attributable = new AttributableClass({ test: 1 });

            attributable.mergeCasts({ test: 'boolean' });

            expect(attributable.getOriginal('test')).toBe(true);
        });

        it('should return a default value if given and value not set', () => {
            attributable = new AttributableClass({ test: 1 });

            expect(attributable.getOriginal('some key', 'default value')).toBe('default value');
        });
    });

    describe('getRawOriginal()', () => {
        it('should get the original values from the attributes', () => {
            attributable = new AttributableClass({ test: 1 });

            expect(attributable.getRawOriginal()).toStrictEqual({ test: 1 });
        });

        it('should get a single original value from the attributes', () => {
            attributable = new AttributableClass({ test: 1 });

            expect(attributable.getRawOriginal('test')).toBe(1);
        });

        it('should return a default value if given and value not set', () => {
            attributable = new AttributableClass({ test: 1 });

            expect(attributable.getRawOriginal('some key', 'default value')).toBe('default value');
        });
    });

    describe('getChanges()', () => {
        it('should get the changes since last sync with original', () => {
            attributable = new AttributableClass({ test: 1 });

            expect(attributable.setAttribute('test', 2).getChanges()).toStrictEqual({ test: 2 });
        });

        it('should get the changes for a single key', () => {
            attributable = new AttributableClass({ test: 1 });

            expect(attributable.setAttribute('test', 2).getChanges('test')).toStrictEqual({ test: 2 });
        });

        it('should return null if no changes detected', () => {
            attributable = new AttributableClass({ test: 2 });

            expect(attributable.setAttribute('test', 2).getChanges('test')).toBeNull();
        });
    });

    describe('hasChanges()', () => {
        it('should determine if any changes has been made', () => {
            attributable = new AttributableClass({ test: 1, value: 2 });

            expect(attributable.setAttribute('test', 2).hasChanges()).toBe(true);
        });

        it('should determine if a given key has changed', () => {
            attributable = new AttributableClass({ test: 1, value: 2 });

            expect(attributable.setAttribute('test', 2).hasChanges('test')).toBe(true);
            expect(attributable.hasChanges('value')).toBe(false);
        });
    });

    describe('isDirty()', () => {
        // isDirty an alias of hasChanges
        it('should determine if any changes has been made', () => {
            attributable = new AttributableClass({ test: 1, value: 2 });

            expect(attributable.setAttribute('test', 2).isDirty()).toBe(true);
        });

        it('should determine if a given key has changed', () => {
            attributable = new AttributableClass({ test: 1, value: 2 });

            expect(attributable.setAttribute('test', 2).isDirty('test')).toBe(true);
            expect(attributable.isDirty('value')).toBe(false);
        });
    });

    describe('isClean()', () => {
        it('should determine if any changes has been made', () => {
            attributable = new AttributableClass({ test: 1, value: 2 });

            expect(attributable.setAttribute('test', 2).isClean()).toBe(false);
        });

        it('should determine if a given key has changed', () => {
            attributable = new AttributableClass({ test: 1, value: 2 });

            expect(attributable.setAttribute('test', 2).isClean('test')).toBe(false);
            expect(attributable.isClean('value')).toBe(true);
        });
    });

    describe('only()', () => {
        it('should return only the specified attributes', () => {
            attributable = new AttributableClass({ test: 1, value: 2 });

            expect(attributable.only(['test'])).toStrictEqual({ test: 1 });
        });
    });

    describe('except()', () => {
        it('should return all the attributes except the specified ones', () => {
            attributable = new AttributableClass({ test: 1, value: 2 });

            expect(attributable.except(['test'])).toStrictEqual({ value: 2 });
        });
    });
});
