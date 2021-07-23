import SoftDeletes from './Concerns/SoftDeletes';
import FactoryBuilder from './Factory/FactoryBuilder';
import type HasFactory from '../Contracts/HasFactory';
import type { Attributes } from './Concerns/HasAttributes';
import ModelCollection from './ModelCollection';
import LogicException from '../Exceptions/LogicException';
import { finish, isUuid } from '../Support/string';

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
        return this.getAttribute(this.getKeyName());
    }

    /**
     * Clone the model into a non-exiting instance.
     *
     * @param {string[]|string} except
     */
    public replicate(except?: string[] | string): Model {
        let excluded = [
            this.getKeyName(),
            this.getCreatedAtColumn(),
            this.getUpdatedAtColumn(),
            this.getDeletedAtColumn()
        ];

        if (except) {
            excluded = [...new Set([...excluded, ...Array.isArray(except) ? except : [except]])];
        }

        const attributes = { ...this.getRawAttributes(), ...this.getRelations() };
        Object.keys(attributes)
            .filter(key => excluded.includes(key))
            .forEach(key => delete attributes[key]);

        return new (this.constructor as typeof Model)(attributes);
    }

    /**
     * Determine if two models have the same key and of the same type.
     *
     * @param {any} model
     *
     * @return {boolean}
     */
    public is(model: unknown): model is Model {
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
    public isNot(model: unknown): model is Exclude<typeof model, Model> {
        return !this.is(model);
    }

    /**
     * Gets the current class' name.
     *
     * @return {string}
     */
    public getName(): string {
        return this.constructor.name;
    }

    /**
     * Call the factory fluently from the model.
     */
    public static factory<T extends Model>(times = 1): FactoryBuilder<T> {
        return new FactoryBuilder(this as unknown as new (attributes?: Attributes) => T).times(times);
    }

    /**
     * Get all the models.
     *
     * @return {Promise<Model|ModelCollection<Model>>}
     */
    public static async all(): Promise<ModelCollection<Model>> {
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
    public async save(data?: Attributes): Promise<this> {
        const dataToSave = Object.assign({}, this.exists ? this.getChanges() : this.getRawAttributes(), data);

        if (!Object.keys(dataToSave).length) {
            return this;
        }

        if ('relationType' in this
            && typeof this.relationType === 'string'
            && ['hasOne', 'hasMany'].includes(this.relationType)
        ) {
            this.wheres = this.wheres.filter(where => {
                return where.operator === '='
                    && where.boolean === 'and'
                    && where.column === this.hasOneOrManyParentKeyName;
            });
        }

        const model = await (
            this.exists ? this.update(dataToSave) : this.post(dataToSave)
        );
        this.hasOneOrManyParentKeyName = undefined;

        this.forceFill(Object.assign({}, model.getRawOriginal(), model.getRelations()))
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
    public async update(data: Attributes): Promise<Model> {
        this.throwIfDoesntExists('update');
        return this.setEndpoint(finish(this.getEndpoint(), '/') + String(this.getKey()))
            .patch(data);
    }

    /**
     * Find the model based on the given id.
     *
     * @param {string|number} id
     *
     * @return
     */
    public async find(id: number | string): Promise<Model> {
        return await this
            .setEndpoint(finish(this.getEndpoint(), '/') + String(id))
            .get() as Model;
    }

    /**
     * The static version of the find method.
     *
     * @see Model.prototype.find
     */
    public static async find(id: number | string): Promise<Model> {
        return new this().find(id);
    }

    /**
     * Return multiple models based on the given ids.
     *
     * @param {string[]|number[]} ids
     */
    public async findMany(ids: (number | string)[]): Promise<ModelCollection<Model>> {
        let response = await this
            .resetQueryParameters()
            .whereKey(ids)
            .get();

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
    public static async findMany(ids: (number | string)[]): Promise<ModelCollection<Model>> {
        return new this().findMany(ids);
    }

    /**
     * Refresh the attributes from the backend.
     *
     * @return {Promise<Model>}
     */
    public async refresh(): Promise<Model> {
        this.throwIfDoesntExists('refresh');
        const model = await this.reset().select(this.getAttributeKeys()).find(this.getKey()!);

        return this.forceFill(model.getRawAttributes()).syncOriginal().setLastSyncedAt();
    }

    /**
     * Throw an error if the model does not exists.
     *
     * @param {string} methodName
     *
     * @protected
     *
     * @internal
     */
    protected throwIfDoesntExists(methodName: string): void {
        if (!this.exists) {
            throw new LogicException(
                'Attempted to call ' + methodName + ' on \'' + this.getName()
                + '\' when it has not been persisted yet or it has been soft deleted.'
            );
        }
    }
}
