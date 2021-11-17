import InvalidArgumentException from '../../Exceptions/InvalidArgumentException';
import HasAttributes from './HasAttributes';
import type Model from '../Model';
import type FormatsQueryParameters from '../../Contracts/FormatsQueryParameters';
import type { MaybeArray } from '../../Support/type';

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
    distinctOnly: boolean;
    offset: number;
    limit: number;
    page: number;
}>;

export default class BuildsQuery extends HasAttributes {
    /**
     * The where constraints for the query.
     *
     * @protected
     *
     * @type {object[]}
     */
    protected wheres: WhereDescription[] = [];

    /**
     * The requested columns for the query.
     *
     * @protected
     *
     * @type {string[]}
     */
    protected columns: string[] = [];

    /**
     * The requested eager-loaded models for the query.
     *
     * @protected
     *
     * @type {string[]}
     */
    protected withs: string[] = [];

    /**
     * The override to remove the previously added relations from the request.
     *
     * @protected
     *
     * @type {string}
     */
    protected withouts: string[] = [];

    /**
     * The relations that should be included on every request.
     *
     * @protected
     *
     * @type {string}
     */
    protected withRelations: string[] = [];

    /**
     * The backend scopes to be applied on the query.
     *
     * @protected
     *
     * @type {string[]}
     */
    protected scopes: string[] = [];

    /**
     * The model relations to check for existence.
     *
     * @protected
     *
     * @type {string[]}
     */
    protected relationsExists: string[] = [];

    /**
     * The column ordering for the query.
     *
     * @protected
     *
     * @type {object}
     */
    protected orders: Order[] = [];

    /**
     * Flag indicating that only distinct values should be returned.
     *
     * @protected
     *
     * @type {boolean}
     */
    protected distinctOnly = false;

    /**
     * The number of records to be skipped.
     *
     * @protected
     *
     * @type {number}
     */
    protected offsetCount = 0;

    /**
     * The limit of the number models requested on the query.
     *
     * @protected
     *
     * @type {number}
     */
    protected limitCount = 0;

    /**
     * The page number of the paginated models queried.
     *
     * @protected
     *
     * @type {number}
     */
    protected pageNumber = 0;

    /**
     * The available operators.
     *
     * @private
     *
     * @type {string[]}
     */
    private readonly operators: Operator[] = [
        '=', '<', '>', '<=', '>=', '!=', 'like', 'in', 'notIn', 'between', 'notBetween'
    ];

    /**
     * Return the instantiated class.
     *
     * @return {BuildsQuery}
     */
    public static newQuery<T extends Model>(): T {
        return new this as T;
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

        if (this.wheres.length) {
            params.wheres = this.wheres;
        }

        if (this.columns.length) {
            params.columns = this.columns;
        }

        const withRelations = this.withRelations.filter(relation => !this.withs.includes(relation));
        const withs = new Set(this.withs.concat(withRelations));

        withs.forEach(relationName => {
            if (this.withouts.includes(relationName)) {
                withs.delete(relationName);
            }
        });

        if (withs.size) {// todo - filters on relations?
            params.with = [...withs];
        }

        if (this.scopes.length) {
            params.scopes = this.scopes;
        }

        if (this.relationsExists.length) {
            params.relationsExists = this.relationsExists;
        }

        if (this.orders.length) {
            params.orders = this.orders;
        }

        if (this.distinctOnly) {
            params.distinctOnly = this.distinctOnly;
        }

        if (this.offsetCount > 0) {
            params.offset = this.offsetCount;
        }

        if (this.limitCount > 0) {
            params.limit = this.limitCount;
        }

        if (this.pageNumber > 0) {
            params.page = this.pageNumber;
        }

        let parameters = params;

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
    protected resetQueryParameters(): this {
        this.wheres = [];
        this.columns = [];
        this.withs = [];
        this.withouts = [];
        this.scopes = [];
        this.relationsExists = [];
        this.orders = [];
        this.distinctOnly = false;
        this.offsetCount = 0;
        this.limitCount = 0;
        this.pageNumber = 0;

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
        if (!this.operators.includes(operator)) {
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

        const isDuplicate = this.wheres.some(where => {
            return where.column === column
                && where.operator === operator
                && where.boolean === boolean
                // eslint-disable-next-line eqeqeq
                && where.value == value;
        });

        if (isDuplicate) {
            return this;
        }

        this.wheres.push(whereDescription);

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
    public where(
        column: string,
        operator: Operator | unknown,
        value?: unknown,
        boolean: BooleanOperator = 'and'
    ): this {
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
    public static where(
        column: string,
        operator: Operator | unknown,
        value?: unknown,
        boolean: BooleanOperator = 'and'
    ): Model {
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
    public orWhere(column: string, operator: Operator | any, value?: any): this {
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
    public static whereKey(
        value: MaybeArray<number | string>, boolean: BooleanOperator = 'and'
    ): Model {
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
    public static whereKeyNot(
        value: MaybeArray<number | string>, boolean: BooleanOperator = 'and'
    ): Model {
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
    public static whereNull(columns: MaybeArray<string>): Model {
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
    public static whereNotNull(columns: MaybeArray<string>): Model {
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
    public static whereIn(column: string, values: any[], boolean: BooleanOperator = 'and'): Model {
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
    public static whereNotIn(column: string, values: any[], boolean: BooleanOperator = 'and'): Model {
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
    public static whereBetween(column: string, values: any[], boolean: BooleanOperator = 'and'): Model {
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
    public static whereNotBetween(column: string, values: any[], boolean: BooleanOperator = 'and'): Model {
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

        this.limitCount = count;
        return this;
    }

    /**
     * The static version of the limit method.
     *
     * @param {number} count
     *
     * @see BuildsQuery.prototype.limit
     */
    public static limit(count: number): Model {
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

        this.pageNumber = pageNumber;
        return this;
    }

    /**
     * The static version of the page method.
     *
     * @param {number} pageNumber
     *
     * @see BuildsQuery.prototype.page
     */
    public static page(pageNumber: number): Model {
        return this.newQuery().page(pageNumber);
    }

    /**
     * Call the provided function with the query if the given value is true.
     *
     * @param {any} value
     * @param {function} closure
     *
     * @return {this}
     */
    public when(value: any, closure: (instance: this) => any): this {
        if (value) {
            closure(this);
        }

        return this;
    }

    /**
     * The static version of the when method.
     *
     * @param {any} value
     * @param {function} closure
     *
     * @return {BuildsQuery}
     *
     * @see BuildsQuery.prototype.when
     */
    public static when(value: any, closure: (instance: BuildsQuery) => any): Model {
        return this.newQuery().when(value, closure);
    }

    /**
     * Call the provided function with the query if the given value is false.
     *
     * @param {any} value
     * @param {function} closure
     *
     * @return {this}
     */
    public unless(value: any, closure: (instance: this) => any): this {
        if (!value) {
            closure(this);
        }

        return this;
    }

    /**
     * The static version of the unless method.
     *
     * @param {any} value
     * @param {function} closure
     *
     * @return {BuildsQuery}
     *
     * @see BuildsQuery.prototype.unless
     */
    public static unless(value: any, closure: (instance: BuildsQuery) => any): Model {
        return this.newQuery().unless(value, closure);
    }

    /**
     * Request only distinct values on the query.
     *
     * @return {this}
     */
    public distinct(boolean = true): this {
        this.distinctOnly = boolean;

        return this;
    }

    /**
     * The static version of the distinct method.
     *
     * @return {BuildsQuery}
     *
     * @see BuildsQuery.prototype.distinct
     */
    public static distinct(boolean = true): Model {
        return this.newQuery().distinct(boolean);
    }

    /**
     * Tell the api which columns are required.
     *
     * @param {string[]} columns
     *
     * @return {this}
     */
    public select(columns: MaybeArray<string>): this {
        this.columns.push(...Array.isArray(columns) ? columns : [columns]);

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
    public static select(columns: MaybeArray<string>): Model {
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
        this.relationsExists.push(...Array.isArray(relations) ? relations : [relations]);

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
    public static has(relations: MaybeArray<string>): Model {
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
        this.withs.push(...Array.isArray(relations) ? relations : [relations]);

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
    public static with(relations: MaybeArray<string>): Model {
        return this.newQuery().with(relations);
    }

    /**
     * Remove eager loaded relations from the query.
     *
     * @param relations
     */
    public without(relations: MaybeArray<string>): this {
        this.withouts.push(...Array.isArray(relations) ? relations : [relations]);

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
    public static without(relations: MaybeArray<string>): Model {
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
        this.scopes.push(...Array.isArray(scopes) ? scopes : [scopes]);

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
    public static scope(scopes: MaybeArray<string>): Model {
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
        this.orders.push({
            column,
            direction
        });

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
    public static orderBy(column: string, direction: Direction = 'asc'): Model {
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
    public static orderByDesc(column: string): Model {
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
        column = column ?? (this as unknown as Model).getCreatedAtColumn();

        return this.orderBy(column, 'desc');
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
    public static latest(column?: string): Model {
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
        column = column ?? (this as unknown as Model).getCreatedAtColumn();

        return this.orderBy(column, 'asc');
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
    public static oldest(column = 'created_at'): Model {
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

        this.offsetCount = count;
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
    public static offset(count: number): Model {
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
    public static skip(count: number): Model {
        return this.newQuery().skip(count);
    }
}
