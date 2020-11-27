import InvalidArgumentException from '../../Exceptions/InvalidArgumentException';
import HasAttributes from './HasAttributes';
import type Model from '../Model';

export default class BuildsQuery extends HasAttributes {
    /**
     * The where constraints for the query.
     *
     * @protected
     *
     * @type {object[]}
     */
    protected wheres: Record<'column' | 'operator' | 'value' | 'boolean', any>[] = [];

    /**
     * The requested columns for the query.
     *
     * @protected
     *
     * @type {string[]}
     */
    protected columns: string[] = [];

    /**
     * the requested eager-loaded models for the query.
     *
     * @protected
     *
     * @type {string[]}
     */
    protected withs: string[] = [];

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
    protected orders: Record<'column'|'direction', string|'asc'|'desc'>[] = [];

    /**
     * Flag indicating that only distinct values should be returned
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
     * @type {null|number}
     */
    protected limitCount = 0;

    /**
     * The available operators.
     *
     * @private
     *
     * @type {string[]}
     */
    private readonly operators = ['=', '<', '>', '<=', '>=', '!=', 'like', 'in', 'notIn', 'between', 'notBetween'];

    /**
     * Return the instantiated class.
     *
     * @return {BuildsQuery}
     */
    public static newQuery(): BuildsQuery {
        return new this();
    }

    /**
     * Compiles the query parameters into a single object.
     *
     * @protected
     *
     * @return {object}
     */
    protected compileQueryParameters(): Record<string, any> {
        const params: Record<string, any> = {};

        if (this.wheres.length) {
            params.wheres = this.wheres;
        }

        if (this.columns.length) {
            params.columns = this.columns;
        }

        if (this.withs.length) {// todo - filters on relations?
            params.with = this.withs;
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
            params.distinct = this.distinctOnly;
        }

        if (this.offsetCount) {
            params.offset = this.offsetCount;
        }

        if (this.limitCount) {
            params.limit = this.limitCount;
        }

        return params;
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
        this.scopes = [];
        this.relationsExists = [];
        this.orders = [];
        this.distinctOnly = false;
        this.offsetCount = 0;
        this.limitCount = 0;

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
    protected addWhereConstraint(column: string, operator: string, value: any, boolean: 'and' | 'or'): this {
        if (!this.operators.includes(operator)) {
            throw new TypeError('\'' + operator + '\' is not an expected type of operator.');
        }

        this.wheres.push({
            column: column,
            operator: operator,
            value: value,
            boolean: boolean
        });

        return this;
    }

    /**
     * Add a where constraint to the query.
     *
     * @param {string} column
     * @param {any} operator
     * @param {any?} value
     * @param {'and'|'or'} boolean
     *
     * @return {this}
     */
    public where(column: string, operator: string, value?: any, boolean: 'and' | 'or' = 'and'): this {
        return this.addWhereConstraint(
            column,
            value ? operator : '=',
            value ? value : operator,
            boolean
        );
    }

    /**
     * The static version of the where method.
     *
     * @param {string} column
     * @param {string} operator
     * @param {any?} value
     * @param {'and'|'or'} boolean
     *
     * @return {BuildsQuery}
     *
     * @see BuildsQuery.prototype.where
     */
    public static where(column: string, operator: string, value?: any, boolean: 'and' | 'or' = 'and'): BuildsQuery {
        return BuildsQuery.newQuery().addWhereConstraint(
            column,
            value ? operator : '=',
            value ? value : operator,
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
    public orWhere(column: string, operator: string, value?: any): this {
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
    public whereKey(value: string|number|(string|number)[], boolean: 'and'|'or' = 'and'): this {
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
    public static whereKey(value: string|number|(string|number)[], boolean: 'and'|'or' = 'and'): BuildsQuery {
        return BuildsQuery.newQuery().whereKey(value, boolean);
    }

    /**
     * Add an or where key closure to the query.
     *
     * @param {string|number|(string|number)[]} value
     *
     * @return {this}
     */
    public orWhereKey(value: string|number|(string|number)[]): this {
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
    public whereKeyNot(value: string|number|(string|number)[], boolean: 'and'|'or' = 'and'): this {
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
    public static whereKeyNot(value: string|number|(string|number)[], boolean: 'and'|'or' = 'and'): BuildsQuery {
        return BuildsQuery.newQuery().whereKeyNot(value, boolean);
    }

    /**
     * Add a where key not closure to the query.
     *
     * @param {string|number|(string|number)[]} value
     *
     * @return {this}
     */
    public orWhereKeyNot(value: string|number|(string|number)[]): this {
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
    public whereNull(columns: string | string[], boolean: 'and'|'or' = 'and'): this {
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
    public static whereNull(columns: string | string[]): BuildsQuery {
        return BuildsQuery.newQuery().whereNull(columns);
    }

    /**
     * Add an or where null closure to the query.
     *
     * @param {string} columns
     *
     * @return {this}
     */
    public orWhereNull(columns: string | string[]): this {
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
    public whereNotNull(columns: string | string[], boolean: 'and'|'or' = 'and'): this {
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
    public static whereNotNull(columns: string | string[]): BuildsQuery {
        return BuildsQuery.newQuery().whereNotNull(columns);
    }

    /**
     * Add an or where not null closure to the query.
     *
     * @param {string} columns
     *
     * @return {this}
     */
    public orWhereNotNull(columns: string | string[]): this {
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
    public whereIn(column: string, values: any[], boolean: 'and'|'or' = 'and'): this {
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
    public static whereIn(column: string, values: any[], boolean: 'and'|'or' = 'and'): BuildsQuery {
        return BuildsQuery.newQuery().whereIn(column, values, boolean);
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
    public whereNotIn(column: string, values: any[], boolean: 'and'|'or' = 'and'): this {
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
    public static whereNotIn(column: string, values: any[], boolean: 'and'|'or' = 'and'): BuildsQuery {
        return BuildsQuery.newQuery().whereNotIn(column, values, boolean);
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
    public whereBetween(column: string, values: any[], boolean: 'and'|'or' = 'and'): this {
        if (!Array.isArray(values) || values.length !== 2) {
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
    public static whereBetween(column: string, values: any[], boolean: 'and'|'or' = 'and'): BuildsQuery {
        return BuildsQuery.newQuery().whereBetween(column, values, boolean);
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
    public whereNotBetween(column: string, values: any[], boolean: 'and'|'or' = 'and'): this {
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
    public static whereNotBetween(column: string, values: any[], boolean: 'and'|'or' = 'and'): BuildsQuery {
        return BuildsQuery.newQuery().whereNotBetween(column, values, boolean);
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
    public static limit(count: number): BuildsQuery {
        return BuildsQuery.newQuery().limit(count);
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
    public static when(value: any, closure: (instance: BuildsQuery) => any): BuildsQuery {
        return BuildsQuery.newQuery().when(value, closure);
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
    public static unless(value: any, closure: (instance: BuildsQuery) => any): BuildsQuery {
        return BuildsQuery.newQuery().unless(value, closure);
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
    public static distinct(boolean = true): BuildsQuery {
        return BuildsQuery.newQuery().distinct(boolean);
    }

    /**
     * Tell the api which columns are required.
     *
     * @param {string[]} columns
     *
     * @return {this}
     */
    public select(columns: string[]): this {
        this.columns.push(...columns);

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
    public static select(columns: string[]): BuildsQuery {
        return BuildsQuery.newQuery().select(columns);
    }

    /**
     * Add a has check of the related records
     *
     * @param {string[]} relations
     *
     * @return {this}
     */
    public has(relations: string[]): this {
        this.relationsExists.push(...relations.flat());

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
    public static has(relations: string[]): BuildsQuery {
        return BuildsQuery.newQuery().has(relations);
    }

    /**
     * Add eager loaded relations to the query.
     *
     * @param {string[]} relations
     *
     * @return {this}
     */
    public with(relations: string[]): this {
        // todo - validate the relations as if it isn't defined I can't use it on response
        this.withs.push(...relations.flat());

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
    public static with(relations: string[]): BuildsQuery {
        return BuildsQuery.newQuery().with(relations);
    }

    /**
     * Add eager loaded relations to the query.
     *
     * @param {string[]} scopes
     *
     * @return {this}
     */
    public scope(scopes: string[]): this {
        this.scopes.push(...scopes.flat());

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
    public static scope(scopes: string[]): BuildsQuery {
        return BuildsQuery.newQuery().scope(scopes);
    }

    /**
     * Add an ordering of the records for the query.
     *
     * @param {string} column
     * @param {'asc'|'desc'} direction
     *
     * @return {this}
     */
    public orderBy(column: string, direction: 'asc'|'desc' = 'asc'): this {
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
    public static orderBy(column: string, direction: 'asc'|'desc' = 'asc'): BuildsQuery {
        return BuildsQuery.newQuery().orderBy(column, direction);
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
    public static orderByDesc(column: string): BuildsQuery {
        return BuildsQuery.newQuery().orderByDesc(column);
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
    public static latest(column?: string): BuildsQuery {
        return BuildsQuery.newQuery().latest(column);
    }

    /**
     * Add an ordering by ascending of the records for the query.
     *
     * @param {string} column
     *
     * @return {this}
     */
    public oldest(column = 'created_at'): this {
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
    public static oldest(column = 'created_at'): BuildsQuery {
        return BuildsQuery.newQuery().oldest(column);
    }

    /**
     * The offset of the records sent back.
     *
     * @param {number} count
     *
     * @return {this}
     */
    public offset(count: number): this {
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
    public static offset(count: number): BuildsQuery {
        return BuildsQuery.newQuery().offset(count);
    }

    /**
     * An alias for the offset method.
     *
     * @param {number} count
     *
     * @return {this}
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
    public static skip(count: number): BuildsQuery {
        return BuildsQuery.newQuery().skip(count);
    }
}
