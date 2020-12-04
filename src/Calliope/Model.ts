import SoftDeletes from './Concerns/SoftDeletes';
import FactoryBuilder from './Factory/FactoryBuilder';
import type HasFactory from '../Contracts/HasFactory';

// todo - https://www.npmjs.com/package/@qiwi/mixin

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
    get exists(): boolean {
        let boolean = String(this.getKey()).isUuid() || !isNaN(Number(this.getKey()));

        if (boolean && this.usesTimestamps()) {
            boolean = !!this.getAttribute(this.getCreatedAtColumn(), false);
        }

        if (boolean && this.usesSoftDeletes()) {
            boolean = !!this.getAttribute(this.getDeletedAtColumn(), false);
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
    public getKey(): string | number {
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

        return new (<typeof Model> this.constructor)(this.except(excluded));
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
    public static factory(): FactoryBuilder {
        return new FactoryBuilder(this);
    }

    // static async all(): Promise<ModelCollection<Model<Record<string, unknown>>>> {
    //     await new this().get();
    // }

    // public save() {
    //
    // }

    // public function update() {
    //
    // }

    // todo non-static version
    public async find(id: string|number): Promise<Model> {
        return this
            .setEndpoint(this.getEndpoint().finish('/') + String(id))
            .get() as Promise<Model>;
    }

    // //
    // public async refresh(): Model {
    //     if (!(this as unknown as Model).exists) {
    //         throw new LogicException('Attempted to refresh \'' + (this as unknown as Model).getName() + '\' when it has not been persisted yet');
    //     }
    //
    //     this.select(this.getAttributeKeys()).find(this.getKey());
    // }

    // todo - findMany all, update, save to implement
}
