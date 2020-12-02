import User from '../../mock/Models/User';
import Team from '../../mock/Models/Team';
import LogicException from '../../../src/Exceptions/LogicException';
import InvalidOffsetException from '../../../src/Exceptions/InvalidOffsetException';
import ModelCollection from '../../../src/Calliope/ModelCollection';
import Shift from '../../mock/Models/Shift';
import type Model from '../../../src/Calliope/Model';
import Contract from '../../mock/Models/Contract';

let hasRelations: User;

describe('hasRelations', () => {
    beforeEach(() => {
        hasRelations = User.factory().state('withTeam').create() as User;
    });

    describe('relationDefined()', () => {
        it('should be able to determine if a relation has been defined or not', () => {
            // @ts-expect-error
            expect(hasRelations.relationDefined('team')).toBe(true);
            // @ts-expect-error
            expect(hasRelations.relationDefined('$team')).toBe(true);
            // @ts-expect-error
            expect(hasRelations.relationDefined('user')).toBe(false);
        });
    });

    describe('getRelations()', () => {
        it('should return the loaded relations', () => {
            expect(hasRelations.getRelations().team).toBeInstanceOf(Team);
        });
    });

    describe('loadedRelationKeys()', () => {
        it('should return the loaded relations\' keys', () => {
            expect(hasRelations.loadedRelationKeys()).toHaveLength(1);
            expect(hasRelations.loadedRelationKeys()).toStrictEqual(['team']);
        });
    });

    describe('relationLoaded()', () => {
        it('should be able to determine whether a relation is loaded or not', () => {
            expect(hasRelations.relationLoaded('shifts')).toBe(false);
            expect(hasRelations.relationLoaded('team')).toBe(true);
            expect(hasRelations.relationLoaded('$team')).toBe(true);
        });
    });

    describe('removeRelation()', () => {
        it('should be able to remove a relation from the model', () => {
            expect(hasRelations.relationLoaded('team')).toBe(true);
            expect(hasRelations.removeRelation('team').relationLoaded('team')).toBe(false);
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(hasRelations.$team).not.toBeUndefined();
        });

        it('should be able to remove with the defined prefix too', () => {
            expect(hasRelations.relationLoaded('$team')).toBe(true);
            expect(hasRelations.removeRelation('$team').relationLoaded('team')).toBe(false);
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(hasRelations.$team).not.toBeUndefined();
        });
    });

    describe('getForeignKeyName()', () => {
        it('should return the expected foreign key that is used on the related models', () => {
            expect(hasRelations.getForeignKeyName()).toBe('userId');
        });
    });

    describe('getRelation()', () => {
        it('should throw an error if the relation has not been defined', () => {
            const failingFunc = jest.fn(() => hasRelations.getRelation('shifts'));

            expect(failingFunc).toThrow(
                new LogicException('Trying to access the \'shifts\' relationship before it is loaded.')
            );
        });

        it('should throw an error if the relation has not been loaded', () => {
            const failingFunc = jest.fn(() => hasRelations.getRelation('undefinedRelation'));

            expect(failingFunc).toThrow(
                new InvalidOffsetException('\'undefinedRelation\' relationship is not defined.')
            );
        });

        it('should return the relation', () => {
            expect(hasRelations.getRelation('team')).toBeInstanceOf(Team);
            expect(hasRelations.getRelation('$team')).toBeInstanceOf(Team);
        });
    });

    describe('addRelation()', () => {
        let shifts: ModelCollection<Model>;

        beforeEach(() => {
            shifts = Shift.factory().times(2).create() as ModelCollection<Model>;
        });

        it('should be able to add a relation to the model', () => {
            expect(hasRelations.relationLoaded('shifts')).toBe(false);
            expect(hasRelations.addRelation('shifts', shifts).relationLoaded('$shifts')).toBe(true);

            hasRelations.removeRelation('shifts');
            expect(hasRelations.addRelation('$shifts', shifts).relationLoaded('shifts')).toBe(true);
        });

        it('should throw an error if trying to add undefined relation', () => {
            const failingFunc = jest.fn(() => hasRelations.addRelation('undefinedRelation', shifts));

            expect(failingFunc).toThrow(
                new LogicException('Attempted to add an undefined relation: \'undefinedRelation\'.')
            );
        });

        it('should create magic access to the relation when given models', () => {
            expect(hasRelations.addRelation('shifts', shifts).shifts).toBeInstanceOf(ModelCollection);
        });

        it('should be able to add a relation even if just the attributes or array of attributes are given', () => {
            const team = hasRelations.team;
            hasRelations.removeRelation('team');

            expect(hasRelations.relationLoaded('team')).toBe(false);
            expect(hasRelations.addRelation('shifts', Shift.factory().times(1).raw()).shifts)
                .toBeInstanceOf(ModelCollection);
            expect(hasRelations.addRelation('team', team.getRawOriginal()).team).toBeInstanceOf(Team);
        });
    });

    describe('getRelationType()', () => {
        it('should return the relation type', () => {
            // @ts-expect-error
            expect(hasRelations.getRelationType('team')).toBe('belongsTo');
        });

        it('should throw an error if method nor using the expected relation type', () => {
            // @ts-expect-error
            const failingFunc = jest.fn(() => hasRelations.getRelationType('invalidRelationDefinition'));

            expect(failingFunc).toThrow(new LogicException(
                '\'$invalidRelationDefinition\' relation is not using any of the expected relation types.'
            ));
        });
    });

    describe('relation definitions', () => {
        describe('belongsTo()', () => {
            it('should return the related model', () => {
                expect(hasRelations.$team()).toBeInstanceOf(Team);
            });

            it('should set the expected endpoint', () => {
                expect(hasRelations.$team().getEndpoint()).toBe('teams/' + String(hasRelations.teamId));
            });

            it('should figure out the foreign key if not given', () => {
                expect(hasRelations.$teamWithoutForeignKey()).toBeInstanceOf(Team);
            });

            it('should throw an error if foreign key not set on the calling model', () => {
                hasRelations.deleteAttribute('teamId');
                const failingFunc = jest.fn(() => hasRelations.$team());

                expect(failingFunc).toThrow(new LogicException(
                    '\'User\' doesn\'t have \'teamId\' defined.'
                ));
            });
        });

        describe('belongsToMany()', () => {
            beforeEach(() => {
                hasRelations.setAttribute('shiftId', 1);
            });

            it('should return the related model', () => {
                expect(hasRelations.$inverseShifts()).toBeInstanceOf(Shift);
            });

            it('should compile the url parameters correctly', () => {
                const column = hasRelations.$inverseShifts().getKeyName();

                // @ts-expect-error
                expect(hasRelations.$inverseShifts().compileQueryParameters().wheres).toStrictEqual([{
                    column: column,
                    operator: '=',
                    value: hasRelations.getAttribute('shiftId'),
                    boolean: 'and'
                }]);
            });

            it('should figure out the foreign key if not given', () => {
                const column = hasRelations.$inverseShiftsWithoutForeignKey().getKeyName();

                // @ts-expect-error
                expect(hasRelations.$inverseShiftsWithoutForeignKey().compileQueryParameters().wheres).toStrictEqual([{
                    column: column,
                    operator: '=',
                    value: hasRelations.getAttribute('shiftId'),
                    boolean: 'and'
                }]);
            });

            it('should throw an error if foreign key not set on the calling model', () => {
                hasRelations.deleteAttribute('shiftId');
                const failingFunc = jest.fn(() => hasRelations.$inverseShifts());

                expect(failingFunc).toThrow(new LogicException(
                    '\'User\' doesn\'t have \'shiftId\' defined.'
                ));
            });
        });

        describe('hasOne()', () => {
            beforeEach(() => {
                hasRelations.setAttribute('contractId', 1);
            });

            it('should return the related model', () => {
                expect(hasRelations.$contract()).toBeInstanceOf(Contract);
            });

            it('should compile the url parameters correctly', () => {
                // @ts-expect-error
                expect(hasRelations.$contract().compileQueryParameters().wheres).toStrictEqual([{
                    column: hasRelations.getForeignKeyName(),
                    operator: '=',
                    value: hasRelations.getAttribute('contractId'),
                    boolean: 'and'
                }]);
            });

            it('should figure out the foreign key if not given', () => {
                // @ts-expect-error
                expect(hasRelations.$contractWithoutForeignKey().compileQueryParameters().wheres)
                    .toStrictEqual([{
                        column: hasRelations.getForeignKeyName(),
                        operator: '=',
                        value: hasRelations.getAttribute('contractId'),
                        boolean: 'and'
                    }]);
            });
        });

        describe('hasMany()', () => {
            it('should return the related model', () => {
                expect(hasRelations.$shifts()).toBeInstanceOf(Shift);
            });

            it('should compile the url parameters correctly', () => {
                // @ts-expect-error
                expect(hasRelations.$shifts().compileQueryParameters().wheres).toStrictEqual([{
                    column: hasRelations.getForeignKeyName(),
                    operator: '=',
                    value: hasRelations.getKey(),
                    boolean: 'and'
                }]);
            });

            it('should figure out the foreign key if not given', () => {
                // @ts-expect-error
                expect(hasRelations.$shiftsWithoutForeignKey().compileQueryParameters().wheres).toStrictEqual([{
                    column: hasRelations.getForeignKeyName(),
                    operator: '=',
                    value: hasRelations.getKey(),
                    boolean: 'and'
                }]);
            });
        });
    });
});
