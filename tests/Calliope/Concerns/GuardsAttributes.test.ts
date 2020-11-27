import GuardsAttributes from '../../../src/Calliope/Concerns/GuardsAttributes';

class TestClass extends GuardsAttributes {
    protected initialise(): { guarded?: string[]; fillable?: string[] } {
        return {
            fillable: ['attr1']
        };
    }
}

let guardedObject: GuardsAttributes;

describe('guardsAttributes', () => {
    beforeEach(() => {
        guardedObject = new TestClass;
    });

    describe('getFillable()', () => {
        it('can return the fillable array', () => {
            expect(guardedObject.getFillable()).toStrictEqual(['attr1']);
            guardedObject.setFillable(['attr1', 'attr2']);
            expect(guardedObject.getFillable()).toStrictEqual(['attr1', 'attr2']);
        });
    });

    describe('setFillable()', () => {
        it('can set the fillable array', () => {
            guardedObject.setFillable(['attr2']);
            expect(guardedObject.getFillable()).toStrictEqual(['attr2']);
        });
    });

    describe('setGuarded()', () => {
        beforeEach(() => {
            class TestClass extends GuardsAttributes {
                guarded = ['attr1'];
            }

            guardedObject = new TestClass;
        });

        it('can set the fillable array', () => {
            guardedObject.setGuarded(['attr2']);
            expect(guardedObject.getGuarded()).toStrictEqual(['attr2']);
        });
    });

    describe('getGuarded()', () => {
        it('can return the fillable array', () => {
            guardedObject.setGuarded(['attr1', 'attr2']);
            expect(guardedObject.getGuarded()).toStrictEqual(['attr1', 'attr2']);
        });
    });

    describe('mergeGuarded()', () => {
        it('can merge the guarded array', () => {
            guardedObject.mergeGuarded(['attr2']);
            expect(guardedObject.getGuarded()).toStrictEqual(['*', 'attr2']);
        });
    });

    describe('mergeFillable()', () => {
        it('can merge the fillable array', () => {
            guardedObject.mergeFillable(['attr2']);
            expect(guardedObject.getFillable()).toStrictEqual(['attr1', 'attr2']);
        });
    });

    describe('isFillable()', () => {
        it('can determine whether the attribute is fillable or not', () => {
            expect(guardedObject.isFillable('attr1')).toBe(true);
            guardedObject.setGuarded(['attr1']);
            expect(guardedObject.isFillable('attr1')).toBe(true);
            guardedObject.setFillable(['*']);
            expect(guardedObject.isFillable('attr1')).toBe(true);
            guardedObject.setFillable([]);
            expect(guardedObject.isFillable('attr1')).toBe(false);
        });
    });

    describe('isGuarded()', () => {
        it('can determine whether the attribute is guarded or not', () => {
            expect(guardedObject.isGuarded('attr1')).toBe(false);
            guardedObject.setGuarded(['attr1']);
            expect(guardedObject.isGuarded('attr1')).toBe(false);
            guardedObject.setFillable(['*']);
            expect(guardedObject.isGuarded('attr1')).toBe(false);
            guardedObject.setFillable([]);
            expect(guardedObject.isGuarded('attr1')).toBe(true);
        });
    });

    describe('getFillableFromObject()', () => {
        it('can filter an object by what is fillable', () => {
            const attributes = {
                'attr1': 1,
                'attr2': 2
            };
            // @ts-expect-error
            expect(guardedObject.getFillableFromObject(attributes)).toStrictEqual({ 'attr1': 1 });
        });

        it('returns all attributes if fillable includes \'*\'', () => {
            guardedObject.setFillable(['*']);
            const attributes = {
                'attr1': 1,
                'attr2': 2
            };
            // @ts-expect-error
            expect(guardedObject.getFillableFromObject(attributes)).toStrictEqual(attributes);
        });
    });
});

