import SoftDeletes from './Concerns/SoftDeletes';
import FactoryBuilder from './Factory/FactoryBuilder';
import type HasFactory from '../Contracts/HasFactory';
import type { Attributes, AttributeKeys, SimpleAttributes } from './Concerns/HasAttributes';
import ModelCollection from './ModelCollection';
import finish from '../Support/string/finish';
import type { MaybeArray, StaticToThis } from '../Support/type';
import cloneDeep from 'lodash.clonedeep';
import isObjectLiteral from '../Support/function/isObjectLiteral';
import { value } from '../Support/function';

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
     * The type of the key that acts as the primary key of the model.
     *
     * @type {'number' | 'string'}
     *
     * @protected
     */
    protected get keyType(): 'number' | 'string' {
        return 'number';
    }

    /**
     * Indicates whether the model exists on the backend or not.
     *
     * @type {boolean}
     */
    public get exists(): boolean {
        let boolean = this.keyType === 'string' ? !!this.getKey() : !isNaN(Number(this.getKey()));
        const lastSyncedAt = '_' + this.setStringCase('last_synced_at');

        if (boolean && this.usesTimestamps()) {
            boolean = !!this.getAttribute(this.getCreatedAtName());
        }

        if (boolean && this.usesSoftDeletes()) {
            boolean = !this.getAttribute(this.getDeletedAtName());
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
    public getKey<
        T extends 'number' | 'string' = this['keyType']
    >(): (T extends 'number' ? number : string) | undefined {
        return this.getAttribute(this.getKeyName()) as (T extends 'number' ? number : string) | undefined;
    }

    /**
     * Construct a new model from context.
     *
     * @param {(object | Model)=} attributes
     *
     * @return {this}
     */
    public new(attributes?: Attributes<this> | this): this {
        return (this.constructor as typeof Model).make(attributes) as this;
    }

    /**
     * Construct a new model instance.
     *
     * @param {(object | Model)=} attributes
     *
     * @return {this}
     */
    public static make<T extends Model>(
        this: StaticToThis<T>,
        attributes?: Attributes<T>
    ): StaticToThis<T>['prototype'] {
        const instance = new this();

        // in case the user ignores the argument type
        if (attributes instanceof Model) {
            // if creating by passing a model, we'll take the attributes
            // in their current state, not the original.
            const allProperties = attributes.getRawAttributes() as Attributes<T>;

            if (isObjectLiteral(attributes.relations)) {
                Object.assign(allProperties, attributes.getRelations());
            }

            attributes = allProperties;
        }

        if (isObjectLiteral(attributes) && Object.keys(attributes).length) {
            instance.fill(attributes).syncOriginal();
        }

        instance.setupMagicAccess();

        return instance;
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
            this.getCreatedAtName(),
            this.getUpdatedAtName(),
            this.getDeletedAtName()
        ]);

        if (except) {
            if (Array.isArray(except)) {
                except.forEach(key => excluded.add(key));
            } else {
                excluded.add(except);
            }
        }

        const attributes = { ...this.getRawAttributes(), ...this.getRelations() } as Attributes<this>;
        excluded.forEach(key => delete attributes[key]);

        return this.new(attributes);
    }

    /**
     * Creates a one-to-one copy of the model without copying by reference.
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
        clone.setLastSyncedAt(this['_' + this.setStringCase('last_synced_at')]);

        // query parameters
        clone.queryParameters = cloneDeep(this.queryParameters);

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
     * Call the provided function with the model if the given value is true.
     *
     * @param {any} val
     * @param {function} closure
     *
     * @return {this}
     */
    public when(val: any, closure: (instance: this) => any): this {
        if (value(val, this.clone())) {
            closure(this);
        }

        return this;
    }

    /**
     * Call the provided function with the model if the given value is false.
     *
     * @param {any} val
     * @param {function} closure
     *
     * @return {this}
     */
    public unless(val: any, closure: (instance: this) => any): this {
        if (!value(val, this.clone())) {
            closure(this);
        }

        return this;
    }

    /**
     * Pass a clone of the model to a given function.
     *
     * @param callback
     */
    public tap(callback: (model: this) => void): this {
        callback(this.clone());

        return this;
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
     * @return {Promise<ModelCollection>}
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
    public async save(data?: SimpleAttributes<this>): Promise<this> {
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
            this.queryParameters.wheres = this.queryParameters.wheres.filter(where => {
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
    public async update(data: SimpleAttributes<this>): Promise<this> {
        this.throwIfModelDoesntExistsWhenCalling('update');
        return this.setModelEndpoint().patch(data);
    }

    /**
     * Find the model based on the given id.
     *
     * @param {string|number} id
     */
    public static async find<T extends StaticToThis>(this: T, id: number | string): Promise<T['prototype']> {
        const instance = new this();
        return instance.setEndpoint(finish(instance.getEndpoint(), '/') + String(id)).get<T['prototype']>();
    }

    /**
     * Return multiple models based on the given ids.
     *
     * @param {string[]|number[]} ids
     */
    public static async findMany<T extends StaticToThis>(
        this: T,
        ids: (number | string)[]
    ): Promise<ModelCollection<T['prototype']>> {
        let response = await new this().whereKey(ids).get();

        if (response instanceof Model) {
            response = new ModelCollection([response]);
        }

        return response;
    }

    /**
     * Refresh the attributes from the backend.
     *
     * @return {Promise<Model>}
     */
    public async refresh(): Promise<this> {
        this.throwIfModelDoesntExistsWhenCalling('refresh');

        const model = await this.reset().setModelEndpoint().select(this.getAttributeKeys()).get<this>() ;

        return this.forceFill(model.getRawAttributes()).syncOriginal().setLastSyncedAt();
    }
}
