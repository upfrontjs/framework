import SoftDeletes from './Concerns/SoftDeletes';
import FactoryBuilder from './Factory/FactoryBuilder';
import type HasFactory from '../Contracts/HasFactory';
import type { Attributes, AttributeKeys } from './Concerns/HasAttributes';
import ModelCollection from './ModelCollection';
import LogicException from '../Exceptions/LogicException';
import { finish, isUuid } from '../Support/string';
import type { MaybeArray, StaticToThis } from '../Support/type';
import { cloneDeep } from 'lodash';

export default class Model extends SoftDeletes implements HasFactory {
    /**
     * The primary key for the model.
     *
     * @type {string}
     *
     * @protected
     */
    protected get primaryKey(): string {
        return 'id';
    }

    /**
     * Indicates whether the model exists on the backend or not.
     *
     * @type {boolean}
     */
    public get exists(): boolean {
        let boolean = isUuid(String(this.getKey())) || !isNaN(Number(this.getKey()));
        const lastSyncedAt = '_' + this.setStringCase('last_synced_at');

        if (boolean && this.usesTimestamps()) {
            boolean = !!this.getAttribute(this.getCreatedAtColumn());
        }

        if (boolean && this.usesSoftDeletes()) {
            boolean = !this.getAttribute(this.getDeletedAtColumn());
        }

        return boolean && lastSyncedAt in this && !!this[lastSyncedAt];
    }

    /**
     * Get the primary key for the model.
     *
     * @type {string}
     */
    public getKeyName(): string {
        return this.primaryKey;
    }

    /**
     * Get the primary key for the model.
     *
     * @return {string|number}
     */
    public getKey(): number | string | undefined {
        return this.getAttribute(this.getKeyName()) as number | string | undefined;
    }

    /**
     * Construct a new model from context.
     *
     * @param {object=} attributes
     *
     * @return {this}
     */
    public new(attributes?: Attributes<this> | Model): this {
        return new (this.constructor as new (attributes?: Attributes<this> | Model) => this)(attributes);
    }

    /**
     * Clone the model into a non-exiting instance.
     *
     * @param {string[]|string} except
     */
    public replicate(except?: MaybeArray<AttributeKeys<this> | string>): this;
    public replicate(except?: MaybeArray<string>): this {
        const excluded = new Set([
            this.getKeyName(),
            this.getCreatedAtColumn(),
            this.getUpdatedAtColumn(),
            this.getDeletedAtColumn()
        ]);

        if (except) {
            if (Array.isArray(except)) {
                except.forEach(key => excluded.add(key));
            } else {
                excluded.add(except);
            }
        }

        const attributes = { ...this.getRawAttributes(), ...this.getRelations() };
        excluded.forEach(key => delete attributes[key]);

        return this.new(attributes);
    }

    /**
     * Creates a one to one copy of the model without copying by reference.
     *
     * @return {this}
     */
    public clone(): this {
        // this takes care of the attributes, relations and setting up descriptors
        const clone = this.new(this);

        // attributes
        clone.original = this.getRawOriginal();
        clone.fillableAttributes = cloneDeep(this.fillableAttributes);
        clone.guardedAttributes = cloneDeep(this.guardedAttributes);
        clone.attributeCasts = cloneDeep(this.attributeCasts);

        // miscellaneous
        clone.hasOneOrManyParentKeyName = this.hasOneOrManyParentKeyName;
        clone.mutatedEndpoint = this.mutatedEndpoint;

        // query parameters
        clone.wheres = cloneDeep(this.wheres);
        clone.columns = cloneDeep(this.columns);
        clone.withs = cloneDeep(this.withs);
        clone.withouts = cloneDeep(this.withouts);
        clone.withRelations = cloneDeep(this.withRelations);
        clone.scopes = cloneDeep(this.scopes);
        clone.relationsExists = cloneDeep(this.relationsExists);
        clone.orders = cloneDeep(this.orders);
        clone.distinctBy = cloneDeep(this.distinctBy);
        clone.offsetCount = this.offsetCount;
        clone.limitCount = this.limitCount;
        clone.pageNumber = this.pageNumber;

        return clone;
    }

    /**
     * Determine if two models have the same key and of the same type.
     *
     * @param {any} model
     *
     * @return {boolean}
     */
    public is<M extends Model>(model: unknown): model is M {
        return model instanceof Model
            && model.getKey() === this.getKey()
            && model.getName() === this.getName();
    }

    /**
     * Determine if two models are not the same.
     *
     * @param {any} model
     *
     * @see Model.prototype.is
     *
     * @return {boolean}
     */
    public isNot<M extends Model>(model: unknown): model is Exclude<typeof model, M> {
        return !this.is(model);
    }

    /**
     * Gets the current class' name.
     *
     * For more information check the {@link https://upfrontjs.com/calliope/#getname|documentation}
     *
     * @return {string}
     */
    public getName(): string {
        // has to define because bundlers might rename the class names
        throw new Error('Your model has to define the getName method.');
    }

    /**
     * Call the factory fluently from the model.
     */
    public static factory<T extends StaticToThis>(this: T, times = 1): FactoryBuilder<T['prototype']> {
        return new FactoryBuilder(this).times(times);
    }

    /**
     * Get all the models.
     *
     * @return {Promise<Model|ModelCollection<Model>>}
     */
    public static async all<T extends StaticToThis>(this: T): Promise<ModelCollection<T['prototype']>> {
        let response = await new this().get();

        if (response instanceof Model) {
            response = new ModelCollection([response]);
        }

        return response;
    }

    /**
     * Save or update the model.
     *
     * @param {object=} data
     */
    public async save(data?: Attributes<this>): Promise<this> {
        const dataToSave = Object.assign(this.exists ? this.getChanges() : this.getRawAttributes(), data);

        if (!Object.keys(dataToSave).length) {
            return this;
        }

        // If the current model is an instantiated `hasOne` or `hasMany` child
        // remove the where filter from the request
        if ('_relationType' in this
            && typeof this._relationType === 'string'
            && ['hasOne', 'hasMany'].includes(this._relationType)
        ) {
            this.wheres = this.wheres.filter(where => {
                return !(where.operator === '='
                    && where.boolean === 'and'
                    && where.column === this.hasOneOrManyParentKeyName);
            });
        }

        const model = await (
            this.exists ? this.update(dataToSave) : this.post(dataToSave)
        );
        this.hasOneOrManyParentKeyName = undefined;

        this.forceFill(Object.assign(model.getRawOriginal(), model.getRelations()))
            .syncOriginal()
            .setLastSyncedAt();

        return this;
    }

    /**
     * Set the correct endpoint and initiate a patch request.
     *
     * @param {object} data
     *
     * @see CallsApi.prototype.patch
     */
    public async update(data: Attributes<this>): Promise<this> {
        this.throwIfModelDoesntExistsWhenCalling('update');
        return this.setEndpoint(finish(this.getEndpoint(), '/') + String(this.getKey()))
            .patch(data);
    }

    /**
     * Find the model based on the given id.
     *
     * @param {string|number} id
     */
    public async find<T extends this>(id: number | string): Promise<T> {
        return await this
            .setEndpoint(finish(this.getEndpoint(), '/') + String(id))
            .get() as T;
    }

    /**
     * The static version of the find method.
     *
     * @see Model.prototype.find
     */
    public static async find<T extends StaticToThis>(this: T, id: number | string): Promise<T['prototype']> {
        return new this().find(id);
    }

    /**
     * Return multiple models based on the given ids.
     *
     * @param {string[]|number[]} ids
     */
    public async findMany<T extends this>(ids: (number | string)[]): Promise<ModelCollection<T>> {
        let response = await this
            .resetQueryParameters()
            .whereKey(ids)
            .get<T>();

        if (response instanceof Model) {
            response = new ModelCollection([response]);
        }

        return response;
    }

    /**
     * The static version of the findMany method.
     *
     * @see Model.prototype.findMany
     */
    public static async findMany<T extends StaticToThis>(
        this: T,
        ids: (number | string)[]
    ): Promise<ModelCollection<T['prototype']>> {
        return new this().findMany(ids);
    }

    /**
     * Refresh the attributes from the backend.
     *
     * @return {Promise<Model>}
     */
    public async refresh(): Promise<this> {
        this.throwIfModelDoesntExistsWhenCalling('refresh');
        const model = await this.reset().select(this.getAttributeKeys()).find(this.getKey()!);

        return this.forceFill(model.getRawAttributes()).syncOriginal().setLastSyncedAt();
    }

    /**
     * Throw an error if the model does not exists before calling the specified method.
     *
     * @param {string} methodName
     *
     * @protected
     *
     * @internal
     */
    protected throwIfModelDoesntExistsWhenCalling(methodName: string): void {
        if (!this.exists) {
            throw new LogicException(
                'Attempted to call ' + methodName + ' on \'' + this.getName()
                + '\' when it has not been persisted yet or it has been soft deleted.'
            );
        }
    }
}
