import User from '../../mock/Models/User';
import Team from '../../mock/Models/Team';
import LogicException from '../../../src/Exceptions/LogicException';
import InvalidOffsetException from '../../../src/Exceptions/InvalidOffsetException';
import ModelCollection from '../../../src/Calliope/ModelCollection';
import Shift from '../../mock/Models/Shift';
import type Model from '../../../src/Calliope/Model';
import Contract from '../../mock/Models/Contract';
import File from '../../mock/Models/File';
import fetchMock from 'jest-fetch-mock';
import { buildResponse, getLastFetchCall } from '../../test-helpers';
import { cloneDeep } from 'lodash';
import InvalidArgumentException from '../../../src/Exceptions/InvalidArgumentException';
import Collection from '../../../src/Support/Collection';
import type { Attributes } from '../../../src/Calliope/Concerns/HasAttributes';
import { config } from '../../setupTests';

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
                new InvalidArgumentException('\'undefinedRelation\' relationship is not defined.')
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

        it('should set relation as model collection even if the given data is a single model', () => {
            expect(hasRelations.addRelation('shifts', Shift.factory().create()).shifts).toBeInstanceOf(ModelCollection);
        });

        it('should throw an error if trying to add undefined relation', () => {
            const failingFunc = jest.fn(() => hasRelations.addRelation('undefinedRelation', shifts));

            expect(failingFunc).toThrow(
                new LogicException('Attempted to add an undefined relation: \'undefinedRelation\'.')
            );
        });

        it('should throw an error if value is collection or array but the relation is of singular type', () => {
            let failingFunc = jest.fn(() => hasRelations.addRelation(
                'contract',
                Contract.factory().times(2).raw()
            ));

            expect(failingFunc).toThrow(
                new InvalidArgumentException(
                    '\'contract\' is a singular relation, received type: \'' + Collection.name + '\'.'
                )
            );

            failingFunc = jest.fn(() => hasRelations.addRelation(
                'contract',
                (Contract.factory().times(2).raw() as Collection<Attributes>).toArray()
            ));

            expect(failingFunc).toThrow(
                new InvalidArgumentException(
                    '\'contract\' is a singular relation, received type: \'' + Array.name + '\'.'
                )
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

    describe('load()', () => {
        beforeEach(() => {
            fetchMock.mockResponseOnce(async () => Promise.resolve(
                buildResponse({
                    ...hasRelations.getRawOriginal(),
                    file: (File.factory().create() as Model).getRawOriginal(),
                    files: (File.factory().times(2).create() as unknown as ModelCollection<File>)
                        .map(file => file.getRawOriginal())
                        .toArray()
                })
            ));
        });

        it('should skip relations if already loaded', async () => {
            const file = File.factory().create() as File;
            hasRelations.addRelation('file', file);

            await hasRelations.load('file').then(model => {
                expect(model).toBeInstanceOf(hasRelations.constructor);
            });

            expect(getLastFetchCall()).toBeUndefined();
        });

        it('should throw an error if any of the relations are not defined',  async () => {
            const failingFunc = jest.fn(async () => hasRelations.load('undefinedRelation'));

            await expect(failingFunc).rejects
                .toStrictEqual(new InvalidOffsetException('\'undefinedRelation\' relationship is not defined.'));
        });

        it('should load the relations onto the model', async () => {
            expect(hasRelations.file).toBeUndefined();
            expect(hasRelations.files).toBeUndefined();

            await hasRelations.load(['file', 'files']);

            expect(hasRelations.file).toBeInstanceOf(File);
            expect(hasRelations.files).toBeInstanceOf(ModelCollection);
        });

        it('should query the related model if only 1 relation is required', async () => {
            await hasRelations.load(['team'], true);

            expect(getLastFetchCall()?.url).toBe(
                String(config.get('baseEndPoint'))
                + '/' + String(hasRelations.team.getEndpoint())
                + '/' + String(hasRelations.team.getKey())
            );
        });

        it('should query the current model with eager loaded relations if multiple relation required',
            async () => {
                await hasRelations.load(['file', 'files']);

                expect(getLastFetchCall()?.url).toBe(
                    String(config.get('baseEndPoint'))
                    + '/' + String(hasRelations.getEndpoint())
                    + '/' + String(hasRelations.getKey())
                    + '?' + 'with[]=file&with[]=files'
                );
            }
        );

        it('should not update attributes on the current model on multiple loaded relations', async () => {
            const originalName = hasRelations.getAttribute('name');
            hasRelations.setAttribute('name', 'updated name');

            await hasRelations.load(['file', 'files']);

            expect(hasRelations.getAttribute('name')).not.toBe(originalName);
        });

        it('should load all relations if forceReload is set to true', async () => {
            fetchMock.resetMocks();
            fetchMock.mockResponseOnce(async () => Promise.resolve(
                buildResponse({
                    ...hasRelations.getRawOriginal(),
                    file: (File.factory().create() as Model).getRawOriginal(),
                    team: cloneDeep(hasRelations.team.getRawOriginal())
                })
            ));

            const originalTeamName = cloneDeep(hasRelations.team.name);
            hasRelations.team.name = 'updated team name';

            await hasRelations.load(['file', 'team'], true);

            expect(hasRelations.team.name).toBe(originalTeamName);
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

    describe('for()', () => {
        it('should set the endpoint for the given models', () => {
            expect(hasRelations.for(hasRelations.team).getEndpoint())
                .toBe(String(hasRelations.team.getEndpoint()) + '/' + String(hasRelations.team.getKey()) + '/users');

            const contract = Contract.factory().create() as Contract;

            expect(hasRelations.for([hasRelations.team, contract]).getEndpoint())
                .toBe(
                    String(hasRelations.team.getEndpoint())
                    + '/' + String(hasRelations.team.getKey())
                    + '/' + String(contract.getEndpoint())
                    + '/' + String(contract.getKey())
                    + '/users'
                );

        });

        it('should omit the key if undefined from the endpoint', () => {
            const contract = Contract.factory().make() as Contract;

            expect(hasRelations.for([hasRelations.team, contract]).getEndpoint())
                .toBe(
                    String(hasRelations.team.getEndpoint())
                    + '/' + String(hasRelations.team.getKey())
                    + '/' + String(contract.getEndpoint())
                    + '/users'
                );
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

        describe('morphTo()', () => {
            let morphModel: File;

            beforeEach(() => {
                morphModel = new File();
            });

            it('should return an instance of the same morph model', () => {
                expect(morphModel.$fileable()).toBeInstanceOf(File);
            });

            it('should set the withs for the next query', () => {
                // @ts-expect-error
                expect(morphModel.$fileable().compileQueryParameters().with).toStrictEqual(['*']);
            });
        });

        describe('morphMany()', () => {
            it('should return an instance of the morph model', () => {
                expect(hasRelations.$files()).toBeInstanceOf(File);
            });

            it('should set the query parameters correctly', () => {
                // @ts-expect-error
                const morphs = hasRelations.$files().getMorphs();

                // @ts-expect-error
                expect(hasRelations.$files().compileQueryParameters().wheres).toStrictEqual([
                    {
                        column: morphs.type,
                        operator: '=',
                        value: hasRelations.getName(),
                        boolean: 'and'
                    },
                    {
                        column: morphs.id,
                        operator: '=',
                        value: hasRelations.getKey(),
                        boolean: 'and'
                    }
                ]);
            });

            it('should figure out the morph name if not given', () => {
                // @ts-expect-error
                const morphs = hasRelations.$filesWithoutMorphName().getMorphs();

                // @ts-expect-error
                expect(hasRelations.$filesWithoutMorphName().compileQueryParameters().wheres).toStrictEqual([
                    {
                        column: morphs.type,
                        operator: '=',
                        value: hasRelations.getName(),
                        boolean: 'and'
                    },
                    {
                        column: morphs.id,
                        operator: '=',
                        value: hasRelations.getKey(),
                        boolean: 'and'
                    }
                ]);
            });
        });

        describe('morphOne()', () => {
            it('should return an instance of the morph model', () => {
                expect(hasRelations.$file()).toBeInstanceOf(File);
            });

            it('should set the query parameters correctly', () => {
                // @ts-expect-error
                const morphs = hasRelations.$file().getMorphs();

                // @ts-expect-error
                expect(hasRelations.$file().compileQueryParameters().wheres).toStrictEqual([
                    {
                        column: morphs.type,
                        operator: '=',
                        value: hasRelations.getName(),
                        boolean: 'and'
                    },
                    {
                        column: morphs.id,
                        operator: '=',
                        value: hasRelations.getKey(),
                        boolean: 'and'
                    }
                ]);
            });

            it('should figure out the morph name if not given', () => {
                // @ts-expect-error
                const morphs = hasRelations.$fileWithoutMorphName().getMorphs();

                // @ts-expect-error
                expect(hasRelations.$fileWithoutMorphName().compileQueryParameters().wheres).toStrictEqual([
                    {
                        column: morphs.type,
                        operator: '=',
                        value: hasRelations.getName(),
                        boolean: 'and'
                    },
                    {
                        column: morphs.id,
                        operator: '=',
                        value: hasRelations.getKey(),
                        boolean: 'and'
                    }
                ]);
            });
        });
    });
});
