import BuildsQuery from '../../../Illuminate/Eloquent/Concerns/BuildsQuery';

class TestClass extends BuildsQuery {
    public compiledParams(): Record<string, unknown> {
        return this.compileQueryParameters();
    }

    public getKeyName(): string {
        return 'id';
    }

    public getCreatedAtColumn(): string {
        return 'created_at';
    }
}

let builder: BuildsQuery;


describe('buildsQuery', () => {
    beforeEach(() => {
        builder = new TestClass();
    });

    describe('newQuery()', () => {
        it('returns an instantiated builder', () => {
            expect(BuildsQuery.newQuery()).toBeInstanceOf(BuildsQuery);
        });
    });

    describe('resetQueryParameters()', () => {
        it('can reset the params to the default values', () => {
            expect(builder.offset(10).compiledParams().offset).toBe(10);
            // @ts-expect-error
            expect(builder.resetQueryParameters().compiledParams().offset).toBeUndefined();
        });
    });

    describe('addWhereConstraint()', () => {
        it('throws error if improper operator is used', () => {
            // @ts-expect-error
            const failingCall = () => builder.addWhereConstraint('column', 'operator', 'or');

            expect(failingCall).toThrow('\'operator\' is not an expected type of operator.');
        });
    });

    describe('where()', () => {
        it('adds a constraint to the params', () => {
            builder.where('column', '=', '1');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'and',
                    'column': 'column',
                    'operator': '=',
                    'value': '1'
                }
            ]);
        });

        it('can be called with 2 arguments only', () => {
            builder.where('column', '1');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'and',
                    'column': 'column',
                    'operator': '=',
                    'value': '1'
                }
            ]);
        });

        it('can be called statically', () => {
            expect(BuildsQuery.where('column', 'value')).toBeInstanceOf(BuildsQuery);
        });
    });

    describe('orWhere()', () => {
        it('adds a constraint to the params', () => {
            builder.orWhere('column', '=', '1');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'or',
                    'column': 'column',
                    'operator': '=',
                    'value': '1'
                }
            ]);
        });

        it('can be called with 2 arguments only', () => {
            builder.orWhere('column', '1');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'or',
                    'column': 'column',
                    'operator': '=',
                    'value': '1'
                }
            ]);
        });
    });

    describe('whereKey()', () => {
        it('adds a constraint to the params', () => {
            builder.whereKey('1');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'and',
                    'column': builder.getKeyName(),
                    'operator': '=',
                    'value': '1'
                }
            ]);
        });

        it('can add constraint for multiple keys', () => {
            builder.whereKey(['1', '2']);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'and',
                    'column': builder.getKeyName(),
                    'operator': 'in',
                    'value': ['1', '2']
                }
            ]);
        });

        it('can be called statically', () => {
            // this method will be available when its called from the Model
            BuildsQuery.prototype.getKeyName = () => 'id';
            expect(BuildsQuery.whereKey('1')).toBeInstanceOf(BuildsQuery);
        });
    });

    describe('orWhereKey()', () => {
        it('adds a constraint to the params', () => {
            builder.orWhereKey('1');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'or',
                    'column': builder.getKeyName(),
                    'operator': '=',
                    'value': '1'
                }
            ]);
        });

        it('can add constraint for multiple keys', () => {
            builder.orWhereKey(['1', '2']);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'or',
                    'column': builder.getKeyName(),
                    'operator': 'in',
                    'value': ['1', '2']
                }
            ]);
        });
    });

    describe('whereKeyNot()', () => {
        it('adds a constraint to the params', () => {
            builder.whereKeyNot('1');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'and',
                    'column': builder.getKeyName(),
                    'operator': '!=',
                    'value': '1'
                }
            ]);
        });

        it('can add constraint for multiple keys', () => {
            builder.whereKeyNot(['1', '2']);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'and',
                    'column': builder.getKeyName(),
                    'operator': 'notIn',
                    'value': ['1', '2']
                }
            ]);
        });

        it('can be called statically', () => {
            // this method will be available when its called from the Model
            BuildsQuery.prototype.getKeyName = () => 'id';
            expect(BuildsQuery.whereKeyNot('1')).toBeInstanceOf(BuildsQuery);
        });
    });

    describe('orWhereKeyNot()', () => {
        it('adds a constraint to the params', () => {
            builder.orWhereKeyNot('1');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'or',
                    'column': builder.getKeyName(),
                    'operator': '!=',
                    'value': '1'
                }
            ]);
        });

        it('can add constraint for multiple keys', () => {
            builder.orWhereKeyNot(['1', '2']);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'or',
                    'column': builder.getKeyName(),
                    'operator': 'notIn',
                    'value': ['1', '2']
                }
            ]);
        });
    });

    describe('whereNull()', () => {
        it('adds a constraint to the params', () => {
            builder.whereNull('column');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'and',
                    'column': 'column',
                    'operator': '=',
                    'value': 'null'
                }
            ]);
        });

        it('can add constraint for multiple keys', () => {
            builder.whereNull(['column1', 'column2']);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'and',
                    'column': 'column1',
                    'operator': '=',
                    'value': 'null'
                },
                {
                    'boolean': 'and',
                    'column': 'column2',
                    'operator': '=',
                    'value': 'null'
                }
            ]);
        });

        it('can be called statically', () => {
            expect(BuildsQuery.whereNull('1')).toBeInstanceOf(BuildsQuery);
        });
    });

    describe('orWhereNull()', () => {
        it('adds a constraint to the params', () => {
            builder.orWhereNull('column');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'or',
                    'column': 'column',
                    'operator': '=',
                    'value': 'null'
                }
            ]);
        });

        it('can add constraint for multiple keys', () => {
            builder.orWhereNull(['column1', 'column2']);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'or',
                    'column': 'column1',
                    'operator': '=',
                    'value': 'null'
                },
                {
                    'boolean': 'or',
                    'column': 'column2',
                    'operator': '=',
                    'value': 'null'
                }
            ]);
        });
    });

    describe('whereNotNull()', () => {
        it('adds a constraint to the params', () => {
            builder.whereNotNull('column');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'and',
                    'column': 'column',
                    'operator': '!=',
                    'value': 'null'
                }
            ]);
        });

        it('can add constraint for multiple keys', () => {
            builder.whereNotNull(['column1', 'column2']);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'and',
                    'column': 'column1',
                    'operator': '!=',
                    'value': 'null'
                },
                {
                    'boolean': 'and',
                    'column': 'column2',
                    'operator': '!=',
                    'value': 'null'
                }
            ]);
        });

        it('can be called statically', () => {
            expect(BuildsQuery.whereNotNull('column')).toBeInstanceOf(BuildsQuery);
        });
    });

    describe('orWhereNotNull()', () => {
        it('adds a constraint to the params', () => {
            builder.orWhereNotNull('column');

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'or',
                    'column': 'column',
                    'operator': '!=',
                    'value': 'null'
                }
            ]);
        });

        it('can add constraint for multiple keys', () => {
            builder.orWhereNotNull(['column1', 'column2']);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'or',
                    'column': 'column1',
                    'operator': '!=',
                    'value': 'null'
                },
                {
                    'boolean': 'or',
                    'column': 'column2',
                    'operator': '!=',
                    'value': 'null'
                }
            ]);
        });
    });

    describe('whereIn()', () => {
        it('adds a constraint to the params', () => {
            builder.whereIn('column', [1, 2]);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'and',
                    'column': 'column',
                    'operator': 'in',
                    'value': [1, 2]
                }
            ]);
        });

        it('can be called statically', () => {
            expect(BuildsQuery.whereIn('column', ['1'])).toBeInstanceOf(BuildsQuery);
        });
    });

    describe('orWhereIn()', () => {
        it('adds a constraint to the params', () => {
            builder.orWhereIn('column', [1, 2]);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'or',
                    'column': 'column',
                    'operator': 'in',
                    'value': [1, 2]
                }
            ]);
        });
    });

    describe('whereNotIn()', () => {
        it('adds a constraint to the params', () => {
            builder.whereNotIn('column', [1, 2]);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'and',
                    'column': 'column',
                    'operator': 'notIn',
                    'value': [1, 2]
                }
            ]);
        });

        it('can be called statically', () => {
            expect(BuildsQuery.whereNotIn('column', ['1'])).toBeInstanceOf(BuildsQuery);
        });
    });

    describe('orWhereNotIn()', () => {
        it('adds a constraint to the params', () => {
            builder.orWhereNotIn('column', [1, 2]);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'or',
                    'column': 'column',
                    'operator': 'notIn',
                    'value': [1, 2]
                }
            ]);
        });
    });

    describe('whereBetween()', () => {
        it('adds a constraint to the params', () => {
            builder.whereBetween('column', [1, 2]);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'and',
                    'column': 'column',
                    'operator': 'between',
                    'value': [1, 2]
                }
            ]);
        });

        it('throws error if the second argument is not an array with the length of 2', () => {
            // @ts-expect-error
            const failingCall = () => builder.whereBetween('column', { 'something': 1 });

            expect(failingCall).toThrow(
                'Expected an array with 2 values for \'whereBetween\' got: ' + JSON.stringify({ 'something': 1 })
            );
        });

        it('can be called statically', () => {
            expect(BuildsQuery.whereBetween('column', ['1', '2'])).toBeInstanceOf(BuildsQuery);
        });
    });

    describe('orWhereBetween()', () => {
        it('adds a constraint to the params', () => {
            builder.orWhereBetween('column', [1, 2]);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'or',
                    'column': 'column',
                    'operator': 'between',
                    'value': [1, 2]
                }
            ]);
        });
    });

    describe('whereNotBetween()', () => {
        it('adds a constraint to the params', () => {
            builder.whereNotBetween('column', [1, 2]);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'and',
                    'column': 'column',
                    'operator': 'notBetween',
                    'value': [1, 2]
                }
            ]);
        });

        it('throws error if the second argument is not an array with the length of 2', () => {
            // @ts-expect-error
            const failingCall = () => builder.whereNotBetween('column', { 'something': 1 });

            expect(failingCall).toThrow(
                'Expected an array with 2 values for \'whereNotBetween\' got: ' + JSON.stringify({ 'something': 1 })
            );
        });

        it('can be called statically', () => {
            expect(BuildsQuery.whereNotBetween('column', ['1', '2'])).toBeInstanceOf(BuildsQuery);
        });
    });

    describe('orWhereNotBetween()', () => {
        it('adds a constraint to the params', () => {
            builder.orWhereNotBetween('column', [1, 2]);

            expect(builder.compiledParams().wheres).toStrictEqual([
                {
                    'boolean': 'or',
                    'column': 'column',
                    'operator': 'notBetween',
                    'value': [1, 2]
                }
            ]);
        });

        it('throws error if the second argument is not an array with the length of 2', () => {
            // @ts-expect-error
            const failingCall = () => builder.orWhereNotBetween('column', { 'something': 1 });

            expect(failingCall).toThrow(
                'Expected an array with 2 values for \'orWhereNotBetween\' got: ' + JSON.stringify({ 'something': 1 })
            );
        });
    });

    describe('limit()', () => {
        it('adds a limit to the params', () => {
            builder.limit(10);

            expect(builder.compiledParams().limit).toBe(10);
        });

        it('can be called statically', () => {
            builder = BuildsQuery.limit(10);

            // @ts-expect-error
            expect(builder.compileQueryParameters().limit).toBe(10);
        });
    });

    describe('when()', () => {
        it('calls the given closure depending on the truthiness if the first argument', () => {
            builder.when(false, builderInstance => builderInstance.limit(10));

            expect(builder.compiledParams().limit).toBeUndefined();

            builder.when(true, builderInstance => builderInstance.limit(10));

            expect(builder.compiledParams().limit).toBe(10);
        });

        it('can be called statically', () => {
            builder = BuildsQuery.when(false, builderInstance => builderInstance.limit(10));

            // @ts-expect-error
            expect(builder.compileQueryParameters().limit).toBeUndefined();

            builder = BuildsQuery.when(true, builderInstance => builderInstance.limit(10));

            // @ts-expect-error
            expect(builder.compileQueryParameters().limit).toBe(10);
        });
    });

    describe('unless()', () => {
        it('calls the given closure depending on the falsiness if the first argument', () => {
            builder.unless(true, builderInstance => builderInstance.limit(10));

            expect(builder.compiledParams().limit).toBeUndefined();

            builder.unless(false, builderInstance => builderInstance.limit(10));

            expect(builder.compiledParams().limit).toBe(10);
        });

        it('can be called statically', () => {
            builder = BuildsQuery.unless(false, builderInstance => builderInstance.limit(10));

            // @ts-expect-error
            expect(builder.compileQueryParameters().limit).toBe(10);

            builder = BuildsQuery.unless(true, builderInstance => builderInstance.limit(10));

            // @ts-expect-error
            expect(builder.compileQueryParameters().limit).toBeUndefined();
        });
    });

    describe('distinct()', () => {
        it('sets the distinct value', () => {
            builder.distinct();

            expect(builder.compiledParams().distinct).toBe(true);

            builder.distinct(false);

            expect(builder.compiledParams().distinct).toBeUndefined();
        });

        it('can be called statically', () => {
            builder = BuildsQuery.distinct();
            // @ts-expect-error
            expect(builder.compileQueryParameters().distinct).toBe(true);
        });
    });

    describe('select()', () => {
        it('can set the selected columns', () => {
            expect(builder.select(['id'])).toBeInstanceOf(BuildsQuery);
            expect(builder.compiledParams().columns).toStrictEqual(['id']);
        });

        it('can be called statically', () => {
            builder = BuildsQuery.select(['id']);
            // @ts-expect-error
            expect(builder.compileQueryParameters().columns).toStrictEqual(['id']);
        });
    });

    describe('has()', () => {
        it('can set relation existence check', () => {
            expect(builder.has(['relation'])).toBeInstanceOf(BuildsQuery);
            expect(builder.compiledParams().relationsExists).toStrictEqual(['relation']);
        });

        it('can be called statically', () => {
            builder = BuildsQuery.has(['relation']);
            // @ts-expect-error
            expect(builder.compileQueryParameters().relationsExists).toStrictEqual(['relation']);
        });
    });

    describe('with()', () => {
        it('can set required relations', () => {
            expect(builder.with(['relation'])).toBeInstanceOf(BuildsQuery);
            expect(builder.compiledParams().with).toStrictEqual(['relation']);
        });

        it('can be called statically', () => {
            builder = BuildsQuery.with(['relation']);
            // @ts-expect-error
            expect(builder.compileQueryParameters().with).toStrictEqual(['relation']);
        });
    });

    describe('scope()', () => {
        it('can set required scopes', () => {
            expect(builder.scope(['testScope'])).toBeInstanceOf(BuildsQuery);
            expect(builder.compiledParams().scopes).toStrictEqual(['testScope']);
        });

        it('can be called statically', () => {
            builder = BuildsQuery.scope(['testScope']);
            // @ts-expect-error
            expect(builder.compileQueryParameters().scopes).toStrictEqual(['testScope']);
        });
    });

    describe('orderBy()', () => {
        it('can define what should be ordered and how', () => {
            expect(builder.orderBy('column').compiledParams().orders).toStrictEqual([
                {
                    column: 'column',
                    direction: 'asc'
                }
            ]);
        });

        it('can be called statically', () => {
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
        it('can define what should be ordered by descending', () => {
            expect(builder.orderByDesc('column').compiledParams().orders).toStrictEqual([
                {
                    column: 'column',
                    direction: 'desc'
                }
            ]);
        });

        it('can be called statically', () => {
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
        it('can order by the given column or the default on descending', () => {
            expect(builder.latest().compiledParams().orders).toStrictEqual([
                {
                    column: 'created_at',
                    direction: 'desc'
                }
            ]);
        });

        it('can be called statically', () => {
            // it will be present when used from the model
            BuildsQuery.prototype.getCreatedAtColumn = builder.getCreatedAtColumn;

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
        it('an order by the given column or the default on ascending', () => {
            expect(builder.oldest().compiledParams().orders).toStrictEqual([
                {
                    column: 'created_at',
                    direction: 'asc'
                }
            ]);
        });

        it('can be called statically', () => {
            // it will be present when used from the model
            BuildsQuery.prototype.getCreatedAtColumn = builder.getCreatedAtColumn;

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
        it('can set the offset of the required records', () => {
            expect(builder.offset(10).compiledParams().offset).toStrictEqual(10);
        });

        it('can be called statically', () => {
            builder = BuildsQuery.offset(10);
            // @ts-expect-error
            expect(builder.compileQueryParameters().offset).toStrictEqual(10);

        });
    });

    describe('skip()', () => {
        it('can set the offset of the required records', () => {
            expect(builder.skip(10).compiledParams().offset).toStrictEqual(10);
        });

        it('can be called statically', () => {
            builder = BuildsQuery.skip(10);
            // @ts-expect-error
            expect(builder.compileQueryParameters().offset).toStrictEqual(10);

        });
    });
});
