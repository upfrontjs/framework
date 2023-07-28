import User from '../../mock/Models/User';
import Team from '../../mock/Models/Team';
import LogicException from '../../../src/Exceptions/LogicException';
import InvalidOffsetException from '../../../src/Exceptions/InvalidOffsetException';
import ModelCollection from '../../../src/Calliope/ModelCollection';
import Shift from '../../mock/Models/Shift';
import Contract from '../../mock/Models/Contract';
import { default as FileModel } from '../../mock/Models/File';
import fetchMock, { getLastRequest } from '../../mock/fetch-mock';
import cloneDeep from 'lodash.clonedeep';
import InvalidArgumentException from '../../../src/Exceptions/InvalidArgumentException';
import Collection from '../../../src/Support/Collection';
import { config } from '../../setupTests';
import { plural } from '../../../src/Support/string';

let hasRelations: User & { team?: Team };

describe('HasRelations', () => {
    beforeEach(() => {
        hasRelations = User.factory().state('withTeam').createOne();
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
            expect(hasRelations.$team).toBeDefined();
        });

        it('should be able to remove with the defined prefix too', () => {
            expect(hasRelations.relationLoaded('$team')).toBe(true);
            expect(hasRelations.removeRelation('$team').relationLoaded('team')).toBe(false);
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(hasRelations.$team).toBeDefined();
        });
    });

    describe('getForeignKeyName()', () => {
        it('should return the expected foreign key that is used on the related models', () => {
            expect(hasRelations.guessForeignKeyName()).toBe('userId');
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
        let shifts: ModelCollection<Shift>;

        beforeEach(() => {
            shifts = Shift.factory().times(2).createMany();
        });

        it('should be able to add a relation to the model', () => {
            expect(hasRelations.relationLoaded('shifts')).toBe(false);
            expect(hasRelations.addRelation('shifts', shifts).relationLoaded('$shifts')).toBe(true);

            hasRelations.removeRelation('shifts');
            expect(hasRelations.addRelation('$shifts', shifts).relationLoaded('shifts')).toBe(true);
        });

        it('should set relation as model collection even if the given data is a single model', () => {
            expect(hasRelations.addRelation('shifts', Shift.factory().createOne()).shifts)
                .toBeInstanceOf(ModelCollection);
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
                Contract.factory().times(2).rawMany()
            ));

            expect(failingFunc).toThrow(
                new InvalidArgumentException(
                    '\'contract\' is a singular relation, received type: \'' + Collection.name + '\'.'
                )
            );

            failingFunc = jest.fn(() => hasRelations.addRelation(
                'contract',
                Contract.factory().times(2).rawMany().toArray()
            ));

            expect(failingFunc).toThrow(
                new InvalidArgumentException(
                    '\'contract\' is a singular relation, received type: \'' + Array.name + '\'.'
                )
            );
        });

        it('should throw an error if value is a model collection but the relation is of singular type', () => {
            const failingFunc = jest.fn(() => hasRelations.addRelation(
                'contract',
                Contract.factory().times(2).createMany()
            ));

            expect(failingFunc).toThrow(
                new InvalidArgumentException(
                    '\'contract\' is a singular relation, received type: \'' + ModelCollection.name + '\'.'
                )
            );
        });

        it('should create magic access to the relation when given models', () => {
            expect(hasRelations.addRelation('shifts', shifts).shifts).toBeInstanceOf(ModelCollection);
        });

        it('should be able to accept attributes or array of attributes', () => {
            const team = hasRelations.team!;
            hasRelations.removeRelation('team');

            expect(hasRelations.relationLoaded('team')).toBe(false);
            expect(hasRelations.addRelation('shifts', Shift.factory().times(1).raw()).shifts)
                .toBeInstanceOf(ModelCollection);
            expect(hasRelations.addRelation('team', team.getRawOriginal()).team).toBeInstanceOf(Team);
        });

        it('should be able to accept a collection of attributes', () => {
            hasRelations.removeRelation('shifts');

            expect(hasRelations.relationLoaded('shifts')).toBe(false);
            expect(hasRelations.addRelation('shifts', Shift.factory().times(1).rawMany()).shifts)
                .toBeInstanceOf(ModelCollection);
            expect(hasRelations.relationLoaded('shifts')).toBe(true);
        });

        it('should be able to accept a model or array of models', () => {
            hasRelations.removeRelation('shifts');

            hasRelations.addRelation('shifts', shifts.toArray());
            expect(hasRelations.shifts).toBeInstanceOf(ModelCollection);
            expect(hasRelations.shifts).toHaveLength(shifts.length);
        });

        it('should be able to accept a collection of models', () => {
            hasRelations.removeRelation('shifts');

            hasRelations.addRelation('shifts', new Collection(shifts.toArray()));
            expect(hasRelations.shifts).toBeInstanceOf(ModelCollection);
            expect(hasRelations.shifts).toHaveLength(shifts.length);
        });

        it('should be able to accept a model collection of models', () => {
            hasRelations.removeRelation('shifts');

            hasRelations.addRelation('shifts', shifts);
            expect(hasRelations.shifts).toBeInstanceOf(ModelCollection);
            expect(hasRelations.shifts).toHaveLength(shifts.length);
        });

        it('should be able to parse a morphTo relation', () => {
            const contract = Contract.factory().createOne({ contractableType: 'team' });
            contract.addRelation('contractable', Team.factory().rawOne());

            expect(contract.contractable).toBeInstanceOf(Team);
        });
    });

    describe('load()', () => {
        beforeEach(() => {
            fetchMock.mockResponseOnce({
                ...hasRelations.getRawOriginal(),
                file: FileModel.factory().createOne().getRawOriginal(),
                files: FileModel.factory().times(2).createMany()
                    .map(file => file.getRawOriginal())
                    .toArray()
            });
        });

        it('should skip relations if already loaded', async () => {
            const file = FileModel.factory().createOne();
            hasRelations.addRelation('file', file);

            await hasRelations.load('file');

            expect(getLastRequest()).toBeUndefined();
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

            expect(hasRelations.file).toBeInstanceOf(FileModel);
            expect(hasRelations.files).toBeInstanceOf(ModelCollection);
        });

        it('should query the related model if only 1 relation is required', async () => {
            await hasRelations.load(['team'], true);

            expect(getLastRequest()?.url).toBe(
                String(config.get('baseEndPoint'))
                + '/' + String(hasRelations.team!.getEndpoint())
                + '/' + String(hasRelations.team!.getKey())
            );
        });

        it('should correctly load single relations', async () => {
            fetchMock.resetMocks();
            hasRelations.loadedRelationKeys().forEach(relation => {
                hasRelations.removeRelation(relation);
            });

            // hasOne
            fetchMock.mockResponseOnce(Contract.factory().raw());
            await hasRelations.load('contract');
            expect(hasRelations.contract).toBeInstanceOf(Contract);

            // belongsTo
            const team = Team.factory().createOne();
            fetchMock.mockResponseOnce(team.getRawOriginal());
            hasRelations.setAttribute('teamId', team.getKey());
            await hasRelations.load('team');
            expect(hasRelations.team).toBeInstanceOf(Team);

            // morphOne
            fetchMock.mockResponseOnce(FileModel.factory().raw());
            await hasRelations.load('file');
            expect(hasRelations.file).toBeInstanceOf(FileModel);

            // morphMany
            fetchMock.mockResponseOnce(FileModel.factory().times(2).createMany()
                .map(file => file.getRawOriginal())
                .toArray());
            await hasRelations.load('files');
            expect(hasRelations.files).toBeInstanceOf(ModelCollection);

            // hasMany
            fetchMock.mockResponseOnce(Shift.factory().times(2).createMany()
                .map(shift => shift.getRawOriginal())
                .toArray());
            await hasRelations.load('shifts');
            expect(hasRelations.shifts).toBeInstanceOf(ModelCollection);

            // belongsToMany
            fetchMock.mockResponseOnce(
                Shift.factory().times(2).createMany()
                    .map(shift => shift.getRawOriginal())
                    .toArray()
            );
            await hasRelations.load('inverseShifts');
            expect(hasRelations.inverseShifts).toBeInstanceOf(ModelCollection);
        });

        it('should query the current model with eager loaded relations if multiple relation required',
            async () => {
                await hasRelations.load(['file', 'files']);

                expect(getLastRequest()?.url).toBe(
                    String(config.get('baseEndPoint'))
                    + '/' + String(hasRelations.getEndpoint())
                    + '/' + String(hasRelations.getKey())
                    + '?' + 'with[0]=file&with[1]=files'
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
            fetchMock.mockResponseOnce({
                ...hasRelations.getRawOriginal(),
                file: FileModel.factory().createOne().getRawOriginal(),
                team: cloneDeep(hasRelations.team!.getRawOriginal())
            });

            const originalTeamName = cloneDeep(hasRelations.team!.name);
            hasRelations.team!.name = 'updated team name';

            await hasRelations.load(['file', 'team'], true);

            expect(hasRelations.team!.name).toBe(originalTeamName);
        });

        it('should throw an error if the model has not been persisted before calling the method', async () => {
            await expect(User.factory().makeOne().load(['file'])).rejects.toThrow(new LogicException(
                'Attempted to call load on \'' + hasRelations.getName()
                + '\' when it has not been persisted yet or it has been soft deleted.'
            ));
        });
    });

    describe('getRelationType()', () => {
        it('should return the relation type', () => {
            // @ts-expect-error
            expect(hasRelations.getRelationType('team')).toBe('belongsTo');
        });

        it('should throw an error if method not using the expected relation type', () => {
            // @ts-expect-error
            const failingFunc = jest.fn(() => hasRelations.getRelationType('invalidRelationDefinition'));

            expect(failingFunc).toThrow(new LogicException(
                '\'$invalidRelationDefinition\' relation is not using any of the expected relation types.'
            ));
        });
    });

    describe('for()', () => {
        it('should set the endpoint for the given models', () => {
            expect(hasRelations.for(hasRelations.team!).getEndpoint())
                .toBe(String(hasRelations.team!.getEndpoint()) + '/' + String(hasRelations.team!.getKey()) + '/users');

            const contract = Contract.factory().createOne();

            expect(hasRelations.for([hasRelations.team!, contract]).getEndpoint())
                .toBe(
                    String(hasRelations.team!.getEndpoint())
                    + '/' + String(hasRelations.team!.getKey())
                    + '/' + String(contract.getEndpoint())
                    + '/' + String(contract.getKey())
                    + '/users'
                );

        });

        it('should omit the key from the endpoint if undefined', () => {
            const contract = Contract.factory().makeOne();

            expect(hasRelations.for([hasRelations.team!, contract]).getEndpoint())
                .toBe(
                    String(hasRelations.team!.getEndpoint())
                    + '/' + String(hasRelations.team!.getKey())
                    + '/' + String(contract.getEndpoint())
                    + '/users'
                );
        });

        it('should accept model constructor(s) as argument', () => {
            expect(hasRelations.for([Team, Contract]).getEndpoint()).toBe('teams/contracts/users');
        });
    });

    describe('setModelEndpoint()', () => {
        it('should throw an error if primary key isn\'t set', () => {
            expect(() => User.factory().makeOne().setModelEndpoint()).toThrow(
                new LogicException('Primary key missing when calling setModelEndpoint method')
            );
        });

        it('should set the endpoint to resource endpoint', () => {
            const endpoint = hasRelations.getEndpoint();
            expect(hasRelations.setModelEndpoint().getEndpoint()).toBe(endpoint + '/' + String(hasRelations.getKey()));
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
            it('should return the related model', () => {
                expect(hasRelations.$inverseShifts()).toBeInstanceOf(Shift);
            });

            it('should compile the url parameters correctly', () => {
                // @ts-expect-error
                expect(hasRelations.$inverseShifts().compileQueryParameters().wheres)
                    .toStrictEqual([{
                        column: plural(hasRelations.getName()).toLowerCase() + '.' + hasRelations.getKeyName(),
                        operator: '=',
                        value: hasRelations.getKey(),
                        boolean: 'and'
                    }]);
            });

            it('should figure out the foreign key if not given', () => {
                // @ts-expect-error
                expect(hasRelations.$inverseShiftsWithoutRelationName().compileQueryParameters().wheres)
                    .toStrictEqual([{
                        column: plural(hasRelations.getName()).toLowerCase() + '.' + hasRelations.getKeyName(),
                        operator: '=',
                        value: hasRelations.getKey(),
                        boolean: 'and'
                    }]);
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
                    column: hasRelations.guessForeignKeyName(),
                    operator: '=',
                    value: hasRelations.getAttribute('contractId'),
                    boolean: 'and'
                }]);
            });

            it('should figure out the foreign key if not given', () => {
                // @ts-expect-error
                expect(hasRelations.$contractWithoutForeignKey().compileQueryParameters().wheres)
                    .toStrictEqual([{
                        column: hasRelations.guessForeignKeyName(),
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
                    column: hasRelations.guessForeignKeyName(),
                    operator: '=',
                    value: hasRelations.getKey(),
                    boolean: 'and'
                }]);
            });

            it('should figure out the foreign key if not given', () => {
                // @ts-expect-error
                expect(hasRelations.$shiftsWithoutForeignKey().compileQueryParameters().wheres).toStrictEqual([{
                    column: hasRelations.guessForeignKeyName(),
                    operator: '=',
                    value: hasRelations.getKey(),
                    boolean: 'and'
                }]);
            });
        });

        describe('morphTo()', () => {
            let morphModel: Contract;

            beforeEach(() => {
                morphModel = Contract.factory().createOne();
            });

            it('should return an instance of the same morph model', () => {
                expect(morphModel.$contractable()).toBeInstanceOf(Contract);
            });

            it('should set the withs for the next query', () => {
                // @ts-expect-error
                expect(morphModel.$contractable().compileQueryParameters().with).toStrictEqual(['contractable']);
            });

            it('should set the expected endpoint', () => {
                expect(morphModel.$contractable().getEndpoint()).toBe('contracts/' + String(morphModel.getKey()));
            });

            it('should correctly build the morphTo relation', async () => {
                const contractAttributes = Contract.factory().rawOne({
                    contractableType: 'team',
                    contractableId: 1,
                    contractable: Team.factory().rawOne()
                });
                // load's beforeEach somehow bleeds into this
                fetchMock.resetMocks();
                fetchMock.mockResponseOnce(contractAttributes);

                const contractable = await morphModel
                    .$contractable()
                    .get<Contract>()
                    .then(c => c.contractable);

                expect(contractable).toBeInstanceOf(Team);
            });

            it('should throw an error if the callback argument is of wrong type', () => {
                // eslint-disable-next-line jest/unbound-method,@typescript-eslint/unbound-method
                const initialCallback = morphModel.$contractable;
                // @ts-expect-error - setting wrong type intentionally
                morphModel.$contractable = () => morphModel.morphTo(false);

                expect(() => morphModel.addRelation('contractable', Team.factory().rawOne()))
                    .toThrow(new InvalidArgumentException(
                        'The morphTo relation was called with invalid argument type.'
                    ));

                morphModel.$contractable = initialCallback;
            });
        });

        describe('morphMany()', () => {
            it('should return an instance of the morph model', () => {
                expect(hasRelations.$files()).toBeInstanceOf(FileModel);
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
                expect(hasRelations.$file()).toBeInstanceOf(FileModel);
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
