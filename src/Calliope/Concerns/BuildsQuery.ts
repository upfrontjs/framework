import InvalidArgumentException from '../../Exceptions/InvalidArgumentException';
import HasAttributes from './HasAttributes';
import type Model from '../Model';
import type FormatsQueryParameters from '../../Contracts/FormatsQueryParameters';
import type { MaybeArray, StaticToThis as BaseStaticToThis } from '../../Support/type';

type StaticToThis = BaseStaticToThis & { newQuery: typeof BuildsQuery['newQuery'] };

type BooleanOperator = 'and' | 'or';
type Direction = 'asc' | 'desc';
type Operator = '!=' | '<' | '<=' | '=' | '>' | '>=' | 'between' | 'in' | 'like' | 'notBetween' | 'notIn';
type Order = { column: string; direction: Direction };
type WhereDescription = {
    column: string;
    operator: Operator;
    value: any;
    boolean: BooleanOperator;
};
export type QueryParams = Partial<{
    wheres: WhereDescription[];
    columns: string[];
    with: string[];
    scopes: string[];
    relationsExists: string[];
    orders: Order[];
    distinct: string[];
    offset: number;
    limit: number;
    page: number;
}>;

export default class BuildsQuery extends HasAttributes {
    protected queryParameters: Required<QueryParams> & { without: string[] } = {
        /**
         * The requested columns for the query.
         *
         * @protected
         *
         * @type {string[]}
         */
        columns: [],
        /**
         * Return distinct rows by these columns.
         *
         * @protected
         *
         * @type {string[]}
         */
        distinct: [],
        /**
         * The limit of the number models requested on the query.
         *
         * @protected
         *
         * @type {number}
         */
        limit: 0,
        /**
         * The number of records to be skipped.
         *
         * @protected
         *
         * @type {number}
         */
        offset: 0,
        /**
         * The column ordering for the query.
         *
         * @protected
         *
         * @type {Order[]}
         */
        orders: [],
        /**
         * The page number of the paginated models queried.
         *
         * @protected
         *
         * @type {number}
         */
        page: 0,
        /**
         * The model relations to check for existence.
         *
         * @protected
         *
         * @type {string[]}
         */
        relationsExists: [],
        /**
         * The backend scopes to be applied on the query.
         *
         * @protected
         *
         * @type {string[]}
         */
        scopes: [],
        /**
         * The where constraints for the query.
         *
         * @protected
         *
         * @type {WhereDescription[]}
         */
        wheres: [],
        /**
         * The requested eager-loaded models for the query.
         *
         * @protected
         *
         * @type {string[]}
         */
        with: [],

        /**
         * The override to remove the previously added relations from the request.
         *
         * @protected
         *
         * @type {string}
         */
        without: []
    };

    /**
     * The relations that should be included on every request.
     *
     * @protected
     *
     * @type {string}
     */
    protected withRelations: string[] = [];

    /**
     * Return the instantiated class.
     *
     * @return {BuildsQuery}
     */
    public static newQuery<T extends StaticToThis>(this: T): T['prototype'] {
        return new this;
    }

    /**
     * Compiles the query parameters into a single object.
     *
     * @protected
     *
     * @return {object}
     */
    protected compileQueryParameters(): QueryParams {
        const params: QueryParams = {};

        if (this.queryParameters.wheres.length) {
            params.wheres = this.queryParameters.wheres;
        }

        if (this.queryParameters.columns.length) {
            params.columns = this.queryParameters.columns;
        }

        const withs = new Set([...this.queryParameters.with, ...this.withRelations]);

        withs.forEach(relationName => {
            if (this.queryParameters.without.includes(relationName)) {
                withs.delete(relationName);
            }
        });

        if (withs.size) {// todo - filters on relations?
            params.with = [...withs];
        }

        if (this.queryParameters.scopes.length) {
            params.scopes = this.queryParameters.scopes;
        }

        if (this.queryParameters.relationsExists.length) {
            params.relationsExists = this.queryParameters.relationsExists;
        }

        if (this.queryParameters.orders.length) {
            params.orders = this.queryParameters.orders;
        }

        if (this.queryParameters.distinct.length) {
            params.distinct = this.queryParameters.distinct;
        }

        if (this.queryParameters.offset > 0) {
            params.offset = this.queryParameters.offset;
        }

        if (this.queryParameters.limit > 0) {
            params.limit = this.queryParameters.limit;
        }

        if (this.queryParameters.page > 0) {
            params.page = this.queryParameters.page;
        }

        let parameters: QueryParams = params;

        if ('formatQueryParameters' in this && this.formatQueryParameters instanceof Function) {
            parameters = (this as unknown as FormatsQueryParameters).formatQueryParameters(params);
        }

        return parameters;
    }

    /**
     * Reset the request parameters.
     *
     * @protected
     *
     * @return {this}
     */
    public resetQueryParameters(): this {
        this.queryParameters = {
            columns: [],
            distinct: [],
            limit: 0,
            offset: 0,
            orders: [],
            page: 0,
            relationsExists: [],
            scopes: [],
            wheres: [],
            with: [],
            without: []
        };

        return this;
    }

    /**
     * Add a where constraint to the wheres.
     *
     * @param {string} column
     * @param {string} operator
     * @param {any} value
     * @param {'and'|'or'} boolean
     *
     * @protected
     *
     * @return {this}
     */
    protected addWhereConstraint(column: string, operator: Operator, value: any, boolean: BooleanOperator): this {
        const supportedOperators: Operator[] = [
            '=', '<', '>', '<=', '>=', '!=', 'like', 'in', 'notIn', 'between', 'notBetween'
        ];

        if (!supportedOperators.includes(operator)) {
            throw new InvalidArgumentException('\'' + operator + '\' is not an expected type of operator.');
        }

        // in case of a js user going rogue
        boolean = boolean.toLowerCase() as BooleanOperator;

        if (!['and', 'or'].includes(boolean)) {
            throw new InvalidArgumentException('\'' + boolean + '\' is not an expected type of operator.');
        }

        const whereDescription: WhereDescription = {
            column,
            operator,
            value,
            boolean
        };

        const isDuplicate = this.queryParameters.wheres.some(where => {
            return where.column === column
                && where.operator === operator
                && where.boolean === boolean
                // eslint-disable-next-line eqeqeq
                && where.value == value;
        });

        if (isDuplicate) {
            return this;
        }

        this.queryParameters.wheres.push(whereDescription);

        return this;
    }

    /**
     * Add a where constraint to the query.
     *
     * @param {string} column
     * @param {any} operator
     * @param {any=} value
     * @param {'and'|'or'} boolean
     *
     * @return {this}
     */
    public where(column: string, value?: unknown): this;
    public where(column: string, operator: Operator, value: unknown, boolean?: BooleanOperator): this;
    public where(column: string, operator: unknown, value?: unknown, boolean: BooleanOperator = 'and'): this {
        return this.addWhereConstraint(
            column,
            arguments.length > 2 ? operator as Operator : '=',
            arguments.length > 2 ? value : operator,
            boolean
        );
    }

    /**
     * The static version of the where method.
     *
     * @param {string} column
     * @param {any} operator
     * @param {any=} value
     * @param {'and'|'or'} boolean
     *
     * @return {BuildsQuery}
     *
     * @see BuildsQuery.prototype.where
     */
    public static where<T extends StaticToThis>(this: T, column: string, value: unknown): T['prototype'];
    public static where<T extends StaticToThis>(
        this: T,
        column: string,
        operator: Operator,
        value: unknown,
        boolean?: BooleanOperator
    ): T['prototype'];
    public static where<T extends StaticToThis>(
        this: T,
        column: string,
        operator: unknown,
        value?: unknown,
        boolean: BooleanOperator = 'and'
    ): T['prototype'] {
        return this.newQuery().where(
            column,
            arguments.length > 2 ? operator as Operator : '=',
            arguments.length > 2 ? value : operator,
            boolean
        );
    }

    /**
     * Add an or where closure to the query.
     *
     * @param {string} column
     * @param {any} operator
     * @param {any} value
     *
     * @return {this}
     */
    public orWhere(column: string, value: any): this;
    public orWhere(column: string, operator: Operator, value: any): this;
    public orWhere(column: string, operator: Operator, value?: any): this {
        return this.where(column, value ? operator : '=', value ? value : operator, 'or');
    }

    /**
     * Add a where key closure to the query.
     *
     * @param {string|number|(string|number)[]} value
     * @param {'and'|'or'} boolean
     *
     * @return {this}
     */
    public whereKey(value: MaybeArray<number | string>, boolean: BooleanOperator = 'and'): this {
        const column = (this as unknown as Model).getKeyName();

        if (Array.isArray(value)) {
            return this.whereIn(column, value, boolean);
        }

        return this.where(column, '=', value, boolean);
    }

    /**
     * The static version of the whereKey method.
     *
     * @param {string|number|(string|number)[]} value
     * @param {'and'|'or'} boolean
     *
     * @see BuildsQuery.prototype.whereKey
     */
    public static whereKey<T extends StaticToThis>(
        this: T,
        value: MaybeArray<number | string>, boolean: BooleanOperator = 'and'
    ): T['prototype'] {
        return this.newQuery().whereKey(value, boolean);
    }

    /**
     * Add an or where key closure to the query.
     *
     * @param {string|number|(string|number)[]} value
     *
     * @return {this}
     */
    public orWhereKey(value: MaybeArray<number | string>): this {
        return this.whereKey(value, 'or');
    }

    /**
     * Add a where key not closure to the query.
     *
     * @param {string|number|(string|number)[]} value
     * @param {'and'|'or'} boolean
     *
     * @return {this}
     */
    public whereKeyNot(value: MaybeArray<number | string>, boolean: BooleanOperator = 'and'): this {
        const column = (this as unknown as Model).getKeyName();

        if (Array.isArray(value)) {
            return this.whereNotIn(column, value, boolean);
        }

        return this.where(column, '!=', value, boolean);
    }

    /**
     * The static version of the whereKeyNot method.
     *
     * @param {string|number|(string|number)[]} value
     * @param {'and'|'or'} boolean
     *
     * @see BuildsQuery.prototype.whereNotIn
     */
    public static whereKeyNot<T extends StaticToThis>(
        this: T,
        value: MaybeArray<number | string>, boolean: BooleanOperator = 'and'
    ): T['prototype'] {
        return this.newQuery().whereKeyNot(value, boolean);
    }

    /**
     * Add a where key not closure to the query.
     *
     * @param {string|number|(string|number)[]} value
     *
     * @return {this}
     */
    public orWhereKeyNot(value: MaybeArray<number | string>): this {
        return this.whereKeyNot(value, 'or');
    }

    /**
     * Add a where null closure to the query.
     *
     * @param {string|string[]} columns
     * @param {'and'|'or'} boolean
     *
     * @return {this}
     */
    public whereNull(columns: MaybeArray<string>, boolean: BooleanOperator = 'and'): this {
        if (!Array.isArray(columns)) {
            columns = [columns];
        }

        columns.forEach(column => this.where(column, '=', String(null), boolean));

        return this;
    }

    /**
     * The static version of the whereNull method.
     *
     * @param {string} columns
     *
     * @return {BuildsQuery}
     *
     * @see BuildsQuery.prototype.whereNull
     */
    public static whereNull<T extends StaticToThis>(this: T, columns: MaybeArray<string>): T['prototype'] {
        return this.newQuery().whereNull(columns);
    }

    /**
     * Add an or where null closure to the query.
     *
     * @param {string} columns
     *
     * @return {this}
     */
    public orWhereNull(columns: MaybeArray<string>): this {
        return this.whereNull(columns, 'or');
    }

    /**
     * Add a where not null closure to the query.
     *
     * @param {string} columns
     * @param {'and'|'or'} boolean
     *
     * @return {this}
     */
    public whereNotNull(columns: MaybeArray<string>, boolean: BooleanOperator = 'and'): this {
        if (!Array.isArray(columns)) {
            columns = [columns];
        }

        columns.forEach(column => this.where(column, '!=', String(null), boolean));

        return this;
    }

    /**
     * The static version of the whereNotNull method.
     *
     * @param {string} columns
     *
     * @return {BuildsQuery}
     *
     * @see BuildsQuery.prototype.whereNotNull
     */
    public static whereNotNull<T extends StaticToThis>(this: T, columns: MaybeArray<string>): T['prototype'] {
        return this.newQuery().whereNotNull(columns);
    }

    /**
     * Add an or where not null closure to the query.
     *
     * @param {string} columns
     *
     * @return {this}
     */
    public orWhereNotNull(columns: MaybeArray<string>): this {
        return this.whereNotNull(columns, 'or');
    }

    /**
     * Add a where in closure to the query.
     *
     * @param {string} column
     * @param {any[]} values
     * @param {'and'|'or} boolean
     *
     * @return {this}
     */
    public whereIn(column: string, values: any[], boolean: BooleanOperator = 'and'): this {
        return this.where(column, 'in', values, boolean);
    }

    /**
     * The static version of the whereIn method.
     *
     * @param {string} column
     * @param {any[]} values
     * @param {'and'|'or} boolean
     *
     * @see BuildsQuery.prototype.whereIn
     */
    public static whereIn<T extends StaticToThis>(
        this: T,
        column: string, values: any[], boolean: BooleanOperator = 'and'
    ): T['prototype'] {
        return this.newQuery().whereIn(column, values, boolean);
    }

    /**
     * Add an or where in closure to the query.
     *
     * @param {string} column
     * @param {any[]} values
     *
     * @return {this}
     */
    public orWhereIn(column: string, values: any[]): this {
        return this.whereIn(column,  values, 'or');
    }

    /**
     * Add a where not in closure to the query.
     *
     * @param {string} column
     * @param {any[]} values
     * @param {'and'|'or} boolean
     *
     * @return {this}
     */
    public whereNotIn(column: string, values: any[], boolean: BooleanOperator = 'and'): this {
        return this.where(column, 'notIn', values, boolean);
    }

    /**
     * The static version of the whereNotIn method.
     *
     * @param {string} column
     * @param {any[]} values
     * @param {'and'|'or} boolean
     *
     * @see BuildsQuery.prototype.whereNotIn
     */
    public static whereNotIn<T extends StaticToThis>(
        this: T,
        column: string, values: any[], boolean: BooleanOperator = 'and'
    ): T['prototype'] {
        return this.newQuery().whereNotIn(column, values, boolean);
    }

    /**
     * Add an or where not in closure to the query.
     *
     * @param {string} column
     * @param {any[]} values
     *
     * @return {this}
     */
    public orWhereNotIn(column: string, values: any[]): this {
        return this.whereNotIn(column, values, 'or');
    }

    /**
     * Add a where between closure to the query.
     *
     * @param {string} column
     * @param {any[]} values
     * @param {'and'|'or} boolean
     *
     * @return {this}
     */
    public whereBetween(column: string, values: any[], boolean: BooleanOperator = 'and'): this {
        if (!Array.isArray(values) || Array.isArray(values) && values.length !== 2) {
            throw new InvalidArgumentException('Expected an array with 2 values for \'whereBetween\'' +
                ' got: \'' + JSON.stringify(values) + '\'.');
        }

        return this.where(column, 'between', values, boolean);
    }

    /**
     * The static version of the whereBetween method.
     *
     * @param {string} column
     * @param {any[]} values
     * @param {'and'|'or} boolean
     *
     * @see BuildsQuery.prototype.whereBetween
     */
    public static whereBetween<T extends StaticToThis>(
        this: T,
        column: string, values: any[], boolean: BooleanOperator = 'and'
    ): T['prototype'] {
        return this.newQuery().whereBetween(column, values, boolean);
    }

    /**
     * Add an or where between closure to the query.
     *
     * @param {string} column
     * @param {any[]} values
     *
     * @return {this}
     */
    public orWhereBetween(column: string, values: any[]): this {
        return this.where(column, 'between', values, 'or');
    }

    /**
     * Add a where not between closure to the query.
     *
     * @param {string} column
     * @param {any[]} values
     * @param {'and'|'or} boolean
     *
     * @return {this}
     */
    public whereNotBetween(column: string, values: any[], boolean: BooleanOperator = 'and'): this {
        if (!Array.isArray(values) || values.length !== 2) {
            throw new InvalidArgumentException('Expected an array with 2 values for \'whereNotBetween\'' +
                ' got: \'' + JSON.stringify(values) + '\'.');
        }

        return this.where(column, 'notBetween', values, boolean);
    }

    /**
     * The static version of the whereNotBetween method.
     *
     * @param {string} column
     * @param {any[]} values
     * @param {'and'|'or} boolean
     *
     * @see BuildsQuery.prototype.whereNotBetween
     */
    public static whereNotBetween<T extends StaticToThis>(
        this: T,
        column: string, values: any[], boolean: BooleanOperator = 'and'
    ): T['prototype'] {
        return this.newQuery().whereNotBetween(column, values, boolean);
    }

    /**
     * Add an or where not between closure to the query.
     *
     * @param {string} column
     * @param {any[]} values
     *
     * @return {this}
     */
    public orWhereNotBetween(column: string, values: any[]): this {
        if (!Array.isArray(values) || values.length !== 2) {
            throw new InvalidArgumentException('Expected an array with 2 values for \'orWhereNotBetween\'' +
                ' got: \'' + JSON.stringify(values) + '\'.');
        }

        return this.where(column, 'notBetween', values, 'or');
    }

    /**
     * Set the limit for the returned models on the next request.
     *
     * @param {number} count
     */
    public limit(count: number): this {
        if (typeof count !== 'number') {
            throw new InvalidArgumentException('The limit method expects a number, got: ' + typeof count);
        }

        this.queryParameters.limit = count;
        return this;
    }

    /**
     * The static version of the limit method.
     *
     * @param {number} count
     *
     * @see BuildsQuery.prototype.limit
     */
    public static limit<T extends StaticToThis>(this: T, count: number): T['prototype'] {
        return this.newQuery().limit(count);
    }

    /**
     * Set the page of the returned models for the next request.
     *
     * @param {number} pageNumber
     */
    public page(pageNumber: number): this {
        if (typeof pageNumber !== 'number') {
            throw new InvalidArgumentException('The page method expects a number, got: ' + typeof pageNumber);
        }

        this.queryParameters.page = pageNumber;
        return this;
    }

    /**
     * The static version of the page method.
     *
     * @param {number} pageNumber
     *
     * @see BuildsQuery.prototype.page
     */
    public static page<T extends StaticToThis>(this: T, pageNumber: number): T['prototype'] {
        return this.newQuery().page(pageNumber);
    }

    /**
     * Request only distinct values on the query based on the given columns.
     *
     * @return {this}
     */
    public distinct(columns: MaybeArray<string>): this {
        this.queryParameters.distinct = Array.isArray(columns) ? columns : [columns];

        return this;
    }

    /**
     * The static version of the distinct method.
     *
     * @return {BuildsQuery}
     *
     * @see BuildsQuery.prototype.distinct
     */
    public static distinct<T extends StaticToThis>(this: T, columns: MaybeArray<string>): T['prototype'] {
        return this.newQuery().distinct(columns);
    }

    /**
     * Tell the api which columns are required.
     *
     * @param {string[]} columns
     *
     * @return {this}
     */
    public select(columns: MaybeArray<string>): this {
        this.queryParameters.columns.push(...Array.isArray(columns) ? columns : [columns]);

        return this;
    }

    /**
     * The static version of the select method.
     *
     * @param {string[]} columns
     *
     * @return {BuildsQuery}
     *
     * @see BuildsQuery.prototype.select
     */
    public static select<T extends StaticToThis>(this: T, columns: MaybeArray<string>): T['prototype'] {
        return this.newQuery().select(columns);
    }

    /**
     * Add a has check of the related records
     *
     * @param {string[]} relations
     *
     * @return {this}
     */
    public has(relations: MaybeArray<string>): this {
        this.queryParameters.relationsExists.push(...Array.isArray(relations) ? relations : [relations]);

        return this;
    }

    /**
     * The static version of the has method.
     *
     * @param {string[]} relations
     *
     * @return {BuildsQuery}
     *
     * @see BuildsQuery.prototype.has
     */
    public static has<T extends StaticToThis>(this: T, relations: MaybeArray<string>): T['prototype'] {
        return this.newQuery().has(relations);
    }

    /**
     * Add eager loaded relations to the query.
     *
     * @param {string[]} relations
     *
     * @return {this}
     */
    public with(relations: MaybeArray<string>): this {
        this.queryParameters.with.push(...Array.isArray(relations) ? relations : [relations]);

        return this;
    }

    /**
     * The static version of the with method.
     *
     * @param {string[]} relations
     *
     * @return {BuildsQuery}
     *
     * @see BuildsQuery.prototype.with
     */
    public static with<T extends StaticToThis>(this: T, relations: MaybeArray<string>): T['prototype'] {
        return this.newQuery().with(relations);
    }

    /**
     * Remove eager loaded relations from the query.
     *
     * @param relations
     */
    public without(relations: MaybeArray<string>): this {
        this.queryParameters.without.push(...Array.isArray(relations) ? relations : [relations]);

        return this;
    }

    /**
     * The static version of the with method.
     *
     * @param {string[]} relations
     *
     * @return {BuildsQuery}
     *
     * @see BuildsQuery.prototype.without
     */
    public static without<T extends StaticToThis>(this: T, relations: MaybeArray<string>): T['prototype'] {
        return this.newQuery().without(relations);
    }

    /**
     * Add eager loaded relations to the query.
     *
     * @param {string[]} scopes
     *
     * @return {this}
     */
    public scope(scopes: MaybeArray<string>): this {
        this.queryParameters.scopes.push(...Array.isArray(scopes) ? scopes : [scopes]);

        return this;
    }

    /**
     * The static version of the scope method.
     *
     * @param {string[]} scopes
     *
     * @return {BuildsQuery}
     *
     * @see BuildsQuery.prototype.scope
     */
    public static scope<T extends StaticToThis>(this: T, scopes: MaybeArray<string>): T['prototype'] {
        return this.newQuery().scope(scopes);
    }

    /**
     * Add an ordering of the records for the query.
     *
     * @param {string} column
     * @param {'asc'|'desc'} direction
     *
     * @return {this}
     */
    public orderBy(column: string, direction: Direction = 'asc'): this {
        this.queryParameters.orders.push({ column, direction });

        return this;
    }

    /**
     * The static version of the orderBy method.
     *
     * @param {string} column
     * @param {'asc'|'desc'}direction
     *
     * @return {BuildsQuery}
     *
     * @see BuildsQuery.prototype.orderBy
     */
    public static orderBy<T extends StaticToThis>(
        this: T,
        column: string, direction: Direction = 'asc'
    ): T['prototype'] {
        return this.newQuery().orderBy(column, direction);
    }

    /**
     * Add an ordering by descending of the records for the query.
     *
     * @param {string} column
     *
     * @return {this}
     */
    public orderByDesc(column: string): this {
        return this.orderBy(column, 'desc');
    }

    /**
     * The static version of the orderByDesc method.
     *
     * @param {string} column
     *
     * @return {BuildsQuery}
     *
     * @see BuildsQuery.prototype.orderByDesc
     */
    public static orderByDesc<T extends StaticToThis>(this: T, column: string): T['prototype'] {
        return this.newQuery().orderByDesc(column);
    }

    /**
     * An alias for the orderByDesc method.
     *
     * @param {string=} column
     *
     * @return {this}
     */
    public latest(column?: string): this {
        column = column ?? (this as unknown as Model).getCreatedAtName();

        return this.orderBy(this.setServerStringCase(column), 'desc');
    }

    /**
     * The static version of the latest method.
     *
     * @param {string=} column
     *
     * @return {BuildsQuery}
     *
     * @see BuildsQuery.prototype.latest
     */
    public static latest<T extends StaticToThis>(this: T, column?: string): T['prototype'] {
        return this.newQuery().latest(column);
    }

    /**
     * Add an ordering by ascending of the records for the query.
     *
     * @param {string} column
     *
     * @return {this}
     */
    public oldest(column?: string): this {
        column = column ?? (this as unknown as Model).getCreatedAtName();

        return this.orderBy(this.setServerStringCase(column), 'asc');
    }

    /**
     * The static version of the oldest method.
     *
     * @param {string} column
     *
     * @return {BuildsQuery}
     *
     * @see BuildsQuery.prototype.oldest
     */
    public static oldest<T extends StaticToThis>(this: T, column = 'created_at'): T['prototype'] {
        return this.newQuery().oldest(column);
    }

    /**
     * The offset of the records sent back.
     *
     * @param {number} count
     *
     * @return {this}
     */
    public offset(count: number): this {
        if (typeof count !== 'number') {
            throw new InvalidArgumentException('The offset method expects a number, got: ' + typeof count);
        }

        this.queryParameters.offset = count;
        return this;
    }

    /**
     * The static version of the offset method.
     *
     * @param {number} count
     *
     * @return {BuildsQuery}
     *
     * @see BuildsQuery.prototype.offset
     */
    public static offset<T extends StaticToThis>(this: T, count: number): T['prototype'] {
        return this.newQuery().offset(count);
    }

    /**
     * An alias for the offset method.
     *
     * @param {number} count
     *
     * @return {this}
     *
     * @see BuildsQuery.prototype.offset
     */
    public skip(count: number): this {
        return this.offset(count);
    }

    /**
     * The static version of the skip method.
     *
     * @param {number} count
     *
     * @return {BuildsQuery}
     *
     * @see BuildsQuery.prototype.skip
     */
    public static skip<T extends StaticToThis>(this: T, count: number): T['prototype'] {
        return this.newQuery().skip(count);
    }
}
