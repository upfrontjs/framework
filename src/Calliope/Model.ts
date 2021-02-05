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
    protected get primaryKey(): 'id' | 'uuid' {
        return 'id';
    }

    /**
     * Indicates if the model exists.
     *
     * @type {boolean}
     */
    public get exists(): boolean {
        let boolean = isUuid(String(this.getKey())) || !isNaN(Number(this.getKey()));

        if (boolean && this.usesTimestamps()) {
            boolean = !!this.getAttribute(this.getCreatedAtColumn(), false);
        }

        if (boolean && this.usesSoftDeletes()) {
            boolean = !this.getAttribute(this.getDeletedAtColumn(), false);
        }

        return boolean;
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
     * @param {string[]} except
     */
    public replicate(except?: string[]): Model {
        let excluded = [
            this.getKeyName(),
            this.getCreatedAtColumn(),
            this.getUpdatedAtColumn(),
            this.getDeletedAtColumn()
        ];

        if (except) {
            excluded = [...new Set([...excluded, ...except])];
        }

        return new (this.constructor as typeof Model)(this.except(excluded));
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
    public static factory<T extends Model>(): FactoryBuilder<T> {
        return new FactoryBuilder(this as unknown as new (attributes?: Attributes) => T);
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

        return Promise.resolve(response);
    }

    /**
     * Save or update the model.
     *
     * @param data
     */
    public async save(data?: Attributes): Promise<this> {
        const dataToSave = Object.assign({}, this.getChanges(), data);

        if (!Object.keys(dataToSave).length) {
            return Promise.resolve(this);
        }

        const model = await (this.exists ? this.patch(dataToSave) : this.post(dataToSave)) as Model;
        this.forceFill(Object.assign({}, model.getRawOriginal(), model.getRelations()));

        return Promise.resolve(this);
    }

    /**
     * Find the model based on the given id.
     *
     * @param {string|number} id
     *
     * @return
     */
    public async find(id: number | string): Promise<Model> {
        const model = await this
            .setEndpoint(finish(this.getEndpoint(), '/') + String(id))
            .get() as Model;

        return Promise.resolve(model);
    }

    /**
     * The static version of the find method.
     *
     * @see {Model.prototype.find}
     */
    public static async find(id: number | string): Promise<Model> {
        return new this().find(id);
    }

    /**
     * Return multiple models based on the given ids.
     *
     * @param {string[]|number[]} ids
     */
    public async findMany(ids: (number|string)[]): Promise<ModelCollection<Model>> {
        let response = await this
            .resetQueryParameters()
            .whereKey(ids)
            .get();

        if (response instanceof Model) {
            response = new ModelCollection([response]);
        }

        return Promise.resolve(response);
    }

    /**
     * The static version of the findMany method.
     *
     * @see {Model.prototype.findMany}
     */
    public static async findMany(ids: (number|string)[]): Promise<ModelCollection<Model>> {
        return new this().findMany(ids);
    }


    /**
     * Refresh the attributes from the backend.
     *
     * @return {Promise<Model>}
     */
    public async refresh(): Promise<Model> {
        if (!this.exists) {
            throw new LogicException(
                'Attempted to refresh \'' + this.getName()
                + '\' when it has not been persisted yet.'
            );
        }

        return this.select(this.getAttributeKeys()).find(String(this.getKey()));
    }
}
