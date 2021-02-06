import GuardsAttributes from '../../../src/Calliope/Concerns/GuardsAttributes';

class TestClass extends GuardsAttributes {
    public get fillable(): string[] {
        return ['attr1'];
    }
}

let guardedObject: GuardsAttributes;

describe('GuardsAttributes', () => {
    beforeEach(() => {
        guardedObject = new TestClass;
    });

    describe('getFillable()', () => {
        it('should return the fillable array', () => {
            expect(guardedObject.getFillable()).toStrictEqual(['attr1']);
            guardedObject.setFillable(['attr1', 'attr2']);
            expect(guardedObject.getFillable()).toStrictEqual(['attr1', 'attr2']);
        });
    });

    describe('setFillable()', () => {
        it('should set the fillable array', () => {
            guardedObject.setFillable(['attr2']);
            expect(guardedObject.getFillable()).toStrictEqual(['attr2']);
        });
    });

    describe('setGuarded()', () => {
        beforeEach(() => {
            class TestGuardingClass extends GuardsAttributes {
                public guardedAttributes = ['attr1'];
            }

            guardedObject = new TestGuardingClass;
        });

        it('should set the fillable array', () => {
            guardedObject.setGuarded(['attr2']);
            expect(guardedObject.getGuarded()).toStrictEqual(['attr2']);
        });
    });

    describe('getGuarded()', () => {
        it('should return the fillable array', () => {
            guardedObject.setGuarded(['attr1', 'attr2']);
            expect(guardedObject.getGuarded()).toStrictEqual(['attr1', 'attr2']);
        });
    });

    describe('mergeGuarded()', () => {
        it('should merge the guarded array', () => {
            guardedObject.mergeGuarded(['attr2']);
            expect(guardedObject.getGuarded()).toStrictEqual(['*', 'attr2']);
        });
    });

    describe('mergeFillable()', () => {
        it('should merge the fillable array', () => {
            guardedObject.mergeFillable(['attr2']);
            expect(guardedObject.getFillable()).toStrictEqual(['attr1', 'attr2']);
        });
    });

    describe('isFillable()', () => {
        it('should determine whether the attribute is fillable or not', () => {
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
        it('should determine whether the attribute is guarded or not', () => {
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
        it('should filter an object by what is fillable', () => {
            const attributes = {
                'attr1': 1,
                'attr2': 2
            };
            // @ts-expect-error
            expect(guardedObject.getFillableFromObject(attributes)).toStrictEqual({ 'attr1': 1 });
        });

        it('should return all attributes if fillable includes \'*\'', () => {
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
