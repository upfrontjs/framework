import type Model from '../Model';

export default abstract class Relation {
    /**
     * The instantiated model instance.
     *
     * @protected
     */
    protected model: Model;

    /**
     * An un-constructed model instance.
     *
     * @protected
     */
    protected related: Model;

    /**
     * The standard relation constructor.
     *
     * @param {Model} model
     *
     * @param {Model} related
     *
     * @protected
     */
    constructor(model: Model, related: new (attributes?: Record<string, unknown>) => Model) {
        this.model = model;
        this.related = new related();

        this.getRelated().setEndpoint(this.getEndpoint());
    }

    /**
     * Get the base model.
     *
     * @return {Model}
     */
    public getModel(): Model {
        return this.model;
    }

    /**
     * Get the related model.
     *
     * @return {Model}
     */
    public getRelated(): Model {
        return this.related;
    }

    /**
     * Build the endpoint to be used on the related class.
     *
     * @protected
     */
    protected abstract getEndpoint(): string;
}
