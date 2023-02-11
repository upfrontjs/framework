import type { QueryParams } from '../../../src/Calliope/Concerns/BuildsQuery';
import InvalidArgumentException from '../../../src/Exceptions/InvalidArgumentException';
import type FormatsQueryParameters from '../../../src/Contracts/FormatsQueryParameters';
import { types } from '../../test-helpers';
import Model from '../../../src/Calliope/Model';

class BuildsQuery extends Model {
    public compiledParams(): QueryParams & Record<string, any> {
        return this.compileQueryParameters();
    }

    public override getName(): string {
        return 'BuildsQuery';
    }
}

let builder: BuildsQuery;

describe('BuildsQuery', () => {
    beforeEach(() => {
        builder = new BuildsQuery();
    });

    describe('.withRelations', () => {
        it('should be merged with the relations from the with method without duplicates', () => {
            // @ts-expect-error
            builder.withRelations = ['relation'];

            builder.with(['relation', 'relation2']);

            expect(builder.compiledParams().with).toStrictEqual(['relation', 'relation2']);
        });
    });

    describe('newQuery()', () => {
        it('should returns an instantiated builder', () => {
            expect(BuildsQuery.newQuery()).toBeInstanceOf(BuildsQuery);
        });
    });

    describe('compileQueryParameters', () => {
        it('should call the formatQueryParameters if defined', () => {
            const mockFn = jest.fn();
            class FormatterClass extends BuildsQuery implements FormatsQueryParameters {
                public formatQueryParameters(attributes: QueryParams) {
                    mockFn();
                    return attributes;
                }
            }

            const formatter = new FormatterClass();
            formatter.compiledParams();
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        it('should should use the returned object by the formatQueryParameters', () => {
            class FormatterClass extends BuildsQuery implements FormatsQueryParameters {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                public formatQueryParameters(_attributes: QueryParams) {
                    return { my: 'data' };
                }
            }

            const formatter = new FormatterClass();
            expect(formatter.compiledParams().my).toBeDefined();
            expect(formatter.compiledParams().my).toBe('data');
        });

        it('should only include valid numeric query parameters', () => {
            const compiled = builder.offset(-1).page(-1).limit(-1).compiledParams();

            expect(compiled).not.toHaveProperty('offset');
            expect(compiled).not.toHaveProperty('page');
            expect(compiled).not.toHaveProperty('limit');
        });
    });

    describe('resetQueryParameters()', () => {
        it('should reset the params to the default values', () => {
            expect(builder.offset(10).compiledParams().offset).toBe(10);
            expect(builder.resetQueryParameters().compiledParams().offset).toBeUndefined();
        });
    });

    describe('addWhereConstraint()', () => {
        it('should throw an error if improper operator is used', () => {
            // @ts-expect-error
            const failingCall = () => builder.addWhereConstraint('column', 'operator', 'or');

            expect(failingCall).toThrow(
                new InvalidArgumentException('\'operator\' is not an expected type of operator.')
            );
        });

        it('should throw an error if improper boolean operator given', () => {
            // @ts-expect-error
            const failingCall = () => builder.addWhereConstraint('column', '=', 'value', 'boolean operator');

            expect(failingCall).toThrow(
                new InvalidArgumentException('\'boolean operator\' is not an expected type of operator.')
            );
        });

        it('should ignore duplicate where descriptions', () => {
            // @ts-expect-error
            builder.addWhereConstraint('column', '=', 'value', 'or');
            // @ts-expect-error
            expect(builder.queryParameters.wheres).toHaveLength(1);

            // @ts-expect-error
            builder.addWhereConstraint('column', '=', 'value', 'or');
            // @ts-expect-error
            expect(builder.queryParameters.wheres).toHaveLength(1);

            // @ts-expect-error
            builder.addWhereConstraint('column', '!=', 'value', 'or');
            // @ts-expect-error
            expect(builder.queryParameters.wheres).toHaveLength(2);
        });

        it('should ignore duplicates when comparing numbers and numbers in string format', () => {
            // @ts-expect-error
            builder.addWhereConstraint('column', '=', '1', 'or');
            // @ts-expect-error
            expect(builder.queryParameters.wheres).toHaveLength(1);

            // @ts-expect-error
            builder.addWhereConstraint('column', '=', 1, 'or');
            // @ts-expect-error
            expect(builder.queryParameters.wheres).toHaveLength(1);
        });
    });

    describe('where()', () => {
        it('should add a constraint to the params', () => {
            builder.where('column', '=', '1');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'and',
                    column: 'column',
                    operator: '=',
                    value: '1'
                }
            ]);
        });

        it('should be able to take two arguments only', () => {
            builder.where('column', '1');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'and',
                    column: 'column',
                    operator: '=',
                    value: '1'
                }
            ]);
        });

        it('should be able to be called statically', () => {
            expect(BuildsQuery.where('column', 'value')).toBeInstanceOf(BuildsQuery);
        });
    });

    describe('orWhere()', () => {
        it('should add a constraint to the params', () => {
            builder.orWhere('column', '=', '1');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'or',
                    column: 'column',
                    operator: '=',
                    value: '1'
                }
            ]);
        });

        it('should be able to called with 2 arguments only', () => {
            builder.orWhere('column', '1');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'or',
                    column: 'column',
                    operator: '=',
                    value: '1'
                }
            ]);
        });
    });

    describe('whereKey()', () => {
        it('should add a constraint to the params', () => {
            builder.whereKey('1');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'and',
                    column: builder.getKeyName(),
                    operator: '=',
                    value: '1'
                }
            ]);
        });

        it('should add constraint for multiple keys', () => {
            builder.whereKey(['1', '2']);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'and',
                    column: builder.getKeyName(),
                    operator: 'in',
                    value: ['1', '2']
                }
            ]);
        });

        it('should be able to be called statically', () => {
            // this method will be available when it's called from the Model
            BuildsQuery.prototype.getKeyName = () => 'id';
            expect(BuildsQuery.whereKey('1')).toBeInstanceOf(BuildsQuery);
        });
    });

    describe('orWhereKey()', () => {
        it('should add a constraint to the params', () => {
            builder.orWhereKey('1');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'or',
                    column: builder.getKeyName(),
                    operator: '=',
                    value: '1'
                }
            ]);
        });

        it('should add constraint for multiple keys', () => {
            builder.orWhereKey(['1', '2']);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'or',
                    column: builder.getKeyName(),
                    operator: 'in',
                    value: ['1', '2']
                }
            ]);
        });
    });

    describe('whereKeyNot()', () => {
        it('should add a constraint to the params', () => {
            builder.whereKeyNot('1');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'and',
                    column: builder.getKeyName(),
                    operator: '!=',
                    value: '1'
                }
            ]);
        });

        it('should add constraint for multiple keys', () => {
            builder.whereKeyNot(['1', '2']);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'and',
                    column: builder.getKeyName(),
                    operator: 'notIn',
                    value: ['1', '2']
                }
            ]);
        });

        it('should be able to be called statically', () => {
            // this method will be available when it's called from the Model
            BuildsQuery.prototype.getKeyName = () => 'id';
            expect(BuildsQuery.whereKeyNot('1')).toBeInstanceOf(BuildsQuery);
        });
    });

    describe('orWhereKeyNot()', () => {
        it('should add a constraint to the params', () => {
            builder.orWhereKeyNot('1');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'or',
                    column: builder.getKeyName(),
                    operator: '!=',
                    value: '1'
                }
            ]);
        });

        it('should add constraint for multiple keys', () => {
            builder.orWhereKeyNot(['1', '2']);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'or',
                    column: builder.getKeyName(),
                    operator: 'notIn',
                    value: ['1', '2']
                }
            ]);
        });
    });

    describe('whereNull()', () => {
        it('should add a constraint to the params', () => {
            builder.whereNull('column');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'and',
                    column: 'column',
                    operator: '=',
                    value: 'null'
                }
            ]);
        });

        it('should add constraint for multiple keys', () => {
            builder.whereNull(['column1', 'column2']);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'and',
                    column: 'column1',
                    operator: '=',
                    value: 'null'
                },
                {
                    boolean: 'and',
                    column: 'column2',
                    operator: '=',
                    value: 'null'
                }
            ]);
        });

        it('should be able to be called statically', () => {
            expect(BuildsQuery.whereNull('1')).toBeInstanceOf(BuildsQuery);
        });
    });

    describe('orWhereNull()', () => {
        it('should add a constraint to the params', () => {
            builder.orWhereNull('column');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'or',
                    column: 'column',
                    operator: '=',
                    value: 'null'
                }
            ]);
        });

        it('should add constraint for multiple keys', () => {
            builder.orWhereNull(['column1', 'column2']);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'or',
                    column: 'column1',
                    operator: '=',
                    value: 'null'
                },
                {
                    boolean: 'or',
                    column: 'column2',
                    operator: '=',
                    value: 'null'
                }
            ]);
        });
    });

    describe('whereNotNull()', () => {
        it('should add a constraint to the params', () => {
            builder.whereNotNull('column');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'and',
                    column: 'column',
                    operator: '!=',
                    value: 'null'
                }
            ]);
        });

        it('should add constraint for multiple keys', () => {
            builder.whereNotNull(['column1', 'column2']);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'and',
                    column: 'column1',
                    operator: '!=',
                    value: 'null'
                },
                {
                    boolean: 'and',
                    column: 'column2',
                    operator: '!=',
                    value: 'null'
                }
            ]);
        });

        it('should be able to be called statically', () => {
            expect(BuildsQuery.whereNotNull('column')).toBeInstanceOf(BuildsQuery);
        });
    });

    describe('orWhereNotNull()', () => {
        it('should add a constraint to the params', () => {
            builder.orWhereNotNull('column');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'or',
                    column: 'column',
                    operator: '!=',
                    value: 'null'
                }
            ]);
        });

        it('should add constraint for multiple keys', () => {
            builder.orWhereNotNull(['column1', 'column2']);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'or',
                    column: 'column1',
                    operator: '!=',
                    value: 'null'
                },
                {
                    boolean: 'or',
                    column: 'column2',
                    operator: '!=',
                    value: 'null'
                }
            ]);
        });
    });

    describe('whereIn()', () => {
        it('should add a constraint to the params', () => {
            builder.whereIn('column', [1, 2]);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'and',
                    column: 'column',
                    operator: 'in',
                    value: [1, 2]
                }
            ]);
        });

        it('should be able to be called statically', () => {
            expect(BuildsQuery.whereIn('column', ['1'])).toBeInstanceOf(BuildsQuery);
        });
    });

    describe('orWhereIn()', () => {
        it('should add a constraint to the params', () => {
            builder.orWhereIn('column', [1, 2]);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'or',
                    column: 'column',
                    operator: 'in',
                    value: [1, 2]
                }
            ]);
        });
    });

    describe('whereNotIn()', () => {
        it('should add a constraint to the params', () => {
            builder.whereNotIn('column', [1, 2]);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'and',
                    column: 'column',
                    operator: 'notIn',
                    value: [1, 2]
                }
            ]);
        });

        it('should be able to be called statically', () => {
            expect(BuildsQuery.whereNotIn('column', ['1'])).toBeInstanceOf(BuildsQuery);
        });
    });

    describe('orWhereNotIn()', () => {
        it('should add a constraint to the params', () => {
            builder.orWhereNotIn('column', [1, 2]);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'or',
                    column: 'column',
                    operator: 'notIn',
                    value: [1, 2]
                }
            ]);
        });
    });

    describe('whereBetween()', () => {
        it('should add a constraint to the params', () => {
            builder.whereBetween('column', [1, 2]);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'and',
                    column: 'column',
                    operator: 'between',
                    value: [1, 2]
                }
            ]);
        });

        it('should throw an error if the second argument is not an array with the length of 2', () => {
            // @ts-expect-error
            const failingCall = () => builder.whereBetween('column', { 'something': 1 });

            expect(failingCall).toThrow(
                'Expected an array with 2 values for \'whereBetween\' got: \''
                + JSON.stringify({ 'something': 1 }) + '\'.'
            );
        });

        it('should be able to be called statically', () => {
            expect(BuildsQuery.whereBetween('column', ['1', '2'])).toBeInstanceOf(BuildsQuery);
        });
    });

    describe('orWhereBetween()', () => {
        it('should add a constraint to the params', () => {
            builder.orWhereBetween('column', [1, 2]);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'or',
                    column: 'column',
                    operator: 'between',
                    value: [1, 2]
                }
            ]);
        });
    });

    describe('whereNotBetween()', () => {
        it('should add a constraint to the params', () => {
            builder.whereNotBetween('column', [1, 2]);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'and',
                    column: 'column',
                    operator: 'notBetween',
                    value: [1, 2]
                }
            ]);
        });

        it('should throw an error if the second argument is not an array with the length of 2', () => {
            // @ts-expect-error
            const failingCall = () => builder.whereNotBetween('column', { 'something': 1 });

            expect(failingCall).toThrow(
                'Expected an array with 2 values for \'whereNotBetween\' got: \''
                + JSON.stringify({ 'something': 1 }) + '\'.'
            );
        });

        it('should be able to be called statically', () => {
            expect(BuildsQuery.whereNotBetween('column', ['1', '2'])).toBeInstanceOf(BuildsQuery);
        });
    });

    describe('orWhereNotBetween()', () => {
        it('should add a constraint to the params', () => {
            builder.orWhereNotBetween('column', [1, 2]);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    boolean: 'or',
                    column: 'column',
                    operator: 'notBetween',
                    value: [1, 2]
                }
            ]);
        });

        it('should throw an error if the second argument is not an array with the length of 2', () => {
            // @ts-expect-error
            const failingCall = () => builder.orWhereNotBetween('column', { 'something': 1 });

            expect(failingCall).toThrow(
                'Expected an array with 2 values for \'orWhereNotBetween\' got: \''
                + JSON.stringify({ 'something': 1 }) + '\'.'
            );
        });
    });

    describe('limit()', () => {
        it('should add a limit to the params', () => {
            builder.limit(10);

            expect(builder.compiledParams().limit).toBe(10);
        });

        it('should be able to be called statically', () => {
            builder = BuildsQuery.limit(10);

            // @ts-expect-error
            expect(builder.compileQueryParameters().limit).toBe(10);
        });

        it('should unset the value if 0 used as argument', () => {
            builder.limit(10).limit(0);

            expect(builder.compiledParams().limit).toBeUndefined();
        });

        it('should throw an error on non-numeric argument', () => {
            const typesToTest = types.filter(type => typeof type !== 'number');

            typesToTest.forEach(type => {
                // @ts-expect-error
                expect(() => builder.limit(type)).toThrow(
                    new InvalidArgumentException('The limit method expects a number, got: ' + typeof type)
                );
            });
        });
    });

    describe('page()', () => {
        it('should add a limit to the params', () => {
            builder.page(10);

            expect(builder.compiledParams().page).toBe(10);
        });

        it('should be able to be called statically', () => {
            builder = BuildsQuery.page(10);

            // @ts-expect-error
            expect(builder.compileQueryParameters().page).toBe(10);
        });

        it('should unset the value if 0 used as argument', () => {
            builder.page(10).page(0);

            expect(builder.compiledParams().page).toBeUndefined();
        });

        it('should throw an error on non-numeric argument', () => {
            const typesToTest = types.filter(type => typeof type !== 'number');

            typesToTest.forEach(type => {
                // @ts-expect-error
                expect(() => builder.page(type)).toThrow(
                    new InvalidArgumentException('The page method expects a number, got: ' + typeof type)
                );
            });
        });
    });

    describe('distinct()', () => {
        it('should set the distinct value', () => {
            builder.distinct('column1');

            expect(builder.compiledParams().distinct).toStrictEqual(['column1']);

            builder.distinct(['column1', 'column2']);

            expect(builder.compiledParams().distinct).toStrictEqual(['column1', 'column2']);
        });

        it('should be able to be called statically', () => {
            builder = BuildsQuery.distinct('column1');
            // @ts-expect-error
            expect(builder.compileQueryParameters().distinct).toStrictEqual(['column1']);
        });
    });

    describe('select()', () => {
        it('should set the selected columns', () => {
            expect(builder.select(['id'])).toBeInstanceOf(BuildsQuery);
            expect(builder.compiledParams().columns).toStrictEqual(['id']);
        });

        it('should be able to be called statically', () => {
            builder = BuildsQuery.select(['id']);
            // @ts-expect-error
            expect(builder.compileQueryParameters().columns).toStrictEqual(['id']);
        });

        it('should accept string or array of strings', () => {
            builder = BuildsQuery.select(['id']);
            // @ts-expect-error
            expect(builder.compileQueryParameters().columns).toStrictEqual(['id']);
            builder = BuildsQuery.select('id');
            // @ts-expect-error
            expect(builder.compileQueryParameters().columns).toStrictEqual(['id']);
        });
    });

    describe('has()', () => {
        it('should set relation existence check', () => {
            expect(builder.has(['relation'])).toBeInstanceOf(BuildsQuery);
            expect(builder.compiledParams().relationsExists).toStrictEqual(['relation']);
        });

        it('should be able to be called statically', () => {
            builder = BuildsQuery.has(['relation']);
            // @ts-expect-error
            expect(builder.compileQueryParameters().relationsExists).toStrictEqual(['relation']);
        });

        it('should accept string or array of strings', () => {
            builder = BuildsQuery.has(['relation']);
            // @ts-expect-error
            expect(builder.compileQueryParameters().relationsExists).toStrictEqual(['relation']);
            builder = BuildsQuery.has('relation');
            // @ts-expect-error
            expect(builder.compileQueryParameters().relationsExists).toStrictEqual(['relation']);
        });
    });

    describe('with()', () => {
        it('should set required relations', () => {
            expect(builder.with(['relation'])).toBeInstanceOf(BuildsQuery);
            expect(builder.compiledParams().with).toStrictEqual(['relation']);
        });

        it('should be able to be called statically', () => {
            builder = BuildsQuery.with(['relation']);
            // @ts-expect-error
            expect(builder.compileQueryParameters().with).toStrictEqual(['relation']);
        });

        it('should accept string or array of strings', () => {
            builder = BuildsQuery.with(['relation']);
            // @ts-expect-error
            expect(builder.compileQueryParameters().with).toStrictEqual(['relation']);
            builder = BuildsQuery.with('relation');
            // @ts-expect-error
            expect(builder.compileQueryParameters().with).toStrictEqual(['relation']);
        });

        it('should not allow duplicate values', () => {
            builder = BuildsQuery.with(['relation', 'relation']);

            // @ts-expect-error
            expect(builder.compileQueryParameters().with).toStrictEqual(['relation']);
        });
    });

    describe('without()', () => {
        it('should unset required relations', () => {
            expect(builder.without(['relation'])).toBeInstanceOf(BuildsQuery);
            expect(
                builder.with(['relation1', 'relation2']).without(['relation1']).compiledParams().with
            ).toStrictEqual(['relation2']);
        });

        it('should be able to be called statically', () => {
            // @ts-expect-error
            const originalWithRelations = BuildsQuery.prototype.withRelations;
            // @ts-expect-error
            BuildsQuery.prototype.withRelations = ['relations'];
            builder = BuildsQuery.without(['relation']);

            // @ts-expect-error
            expect(builder.compileQueryParameters().with).toBeUndefined();

            // @ts-expect-error
            BuildsQuery.prototype.withRelations = originalWithRelations;
        });

        it('should accept string and array of strings', () => {
            // @ts-expect-error
            const originalWithRelations = BuildsQuery.prototype.withRelations;
            // @ts-expect-error
            BuildsQuery.prototype.withRelations = ['relations'];
            builder = BuildsQuery.without(['relation']);

            // @ts-expect-error
            expect(builder.compileQueryParameters().with).toBeUndefined();

            builder = BuildsQuery.without('relation');

            // @ts-expect-error
            expect(builder.compileQueryParameters().with).toBeUndefined();

            // @ts-expect-error
            BuildsQuery.prototype.withRelations = originalWithRelations;
        });
    });

    describe('scope()', () => {
        it('should set required scopes', () => {
            expect(builder.scope(['testScope'])).toBeInstanceOf(BuildsQuery);
            expect(builder.compiledParams().scopes).toStrictEqual(['testScope']);
        });

        it('should be able to be called statically', () => {
            builder = BuildsQuery.scope(['testScope']);
            // @ts-expect-error
            expect(builder.compileQueryParameters().scopes).toStrictEqual(['testScope']);
        });

        it('should accept string and array of strings', () => {
            expect(builder.scope('testScope').compiledParams().scopes).toStrictEqual(['testScope']);
            expect(builder.resetQueryParameters().scope(['testScope']).compiledParams().scopes)
                .toStrictEqual(['testScope']);
        });
    });

    describe('orderBy()', () => {
        it('should define what should be ordered and how', () => {
            expect(builder.orderBy('column').compiledParams().orders).toStrictEqual([
                {
                    column: 'column',
                    direction: 'asc'
                }
            ]);
        });

        it('should be able to be called statically', () => {
            builder = BuildsQuery.orderBy('column');
            // @ts-expect-error
            expect(builder.compileQueryParameters().orders).toStrictEqual([
                {
                    column: 'column',
                    direction: 'asc'
                }
            ]);
        });
    });

    describe('orderByDesc()', () => {
        it('should define what should be ordered by descending', () => {
            expect(builder.orderByDesc('column').compiledParams().orders).toStrictEqual([
                {
                    column: 'column',
                    direction: 'desc'
                }
            ]);
        });

        it('should be able to be called statically', () => {
            builder = BuildsQuery.orderByDesc('column');
            // @ts-expect-error
            expect(builder.compileQueryParameters().orders).toStrictEqual([
                {
                    column: 'column',
                    direction: 'desc'
                }
            ]);
        });
    });

    describe('latest()', () => {
        it('should order by the given column or the default on descending', () => {
            expect(builder.latest().compiledParams().orders).toStrictEqual([
                {
                    column: 'created_at',
                    direction: 'desc'
                }
            ]);
        });

        it('should be able to be called statically', () => {
            // it will be present when used from the model
            // eslint-disable-next-line jest/unbound-method,@typescript-eslint/unbound-method
            BuildsQuery.prototype.getCreatedAtName = builder.getCreatedAtName;

            builder = BuildsQuery.latest();
            // @ts-expect-error
            expect(builder.compileQueryParameters().orders).toStrictEqual([
                {
                    column: 'created_at',
                    direction: 'desc'
                }
            ]);
        });
    });

    describe('oldest()', () => {
        it('should order by the given column or the default on ascending', () => {
            expect(builder.oldest().compiledParams().orders).toStrictEqual([
                {
                    column: 'created_at',
                    direction: 'asc'
                }
            ]);
        });

        it('should be able to be called statically', () => {
            // it will be present when used from the model
            // eslint-disable-next-line jest/unbound-method,@typescript-eslint/unbound-method
            BuildsQuery.prototype.getCreatedAtName = builder.getCreatedAtName;

            builder = BuildsQuery.oldest();
            // @ts-expect-error
            expect(builder.compileQueryParameters().orders).toStrictEqual([
                {
                    column: 'created_at',
                    direction: 'asc'
                }
            ]);

        });
    });

    describe('offset()', () => {
        it('should set the offset of the required records', () => {
            expect(builder.offset(10).compiledParams().offset).toBe(10);
        });

        it('should be able to be called statically', () => {
            builder = BuildsQuery.offset(10);
            // @ts-expect-error
            expect(builder.compileQueryParameters().offset).toBe(10);
        });

        it('should unset the value if 0 used as argument', () => {
            builder.offset(10).offset(0);

            expect(builder.compiledParams().offset).toBeUndefined();
        });

        it('should throw an error on non-numeric argument', () => {
            const typesToTest = types.filter(type => typeof type !== 'number');

            typesToTest.forEach(type => {
                // @ts-expect-error
                expect(() => builder.offset(type)).toThrow(
                    new InvalidArgumentException('The offset method expects a number, got: ' + typeof type)
                );
            });
        });
    });

    describe('skip()', () => {
        it('should set the offset of the required records', () => {
            expect(builder.skip(10).compiledParams().offset).toBe(10);
        });

        it('should be able to be called statically', () => {
            builder = BuildsQuery.skip(10);
            // @ts-expect-error
            expect(builder.compileQueryParameters().offset).toBe(10);
        });
    });
});
