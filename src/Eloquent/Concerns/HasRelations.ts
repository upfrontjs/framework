import type ModelCollection from '../ModelCollection';
import type Model from '../Model';
import LogicException from '../../Exceptions/LogicException';
import CallsApi from './CallsApi';
import InvalidOffsetException from '../../Exceptions/InvalidOffsetException';

export default class HasRelations extends CallsApi {
    /**
     * The loaded relations for the model.
     *
     * @protected
     */
    protected relations: Record<string, (Model | ModelCollection<Model>)> = {};

    /**
     * Load a relationships from remote.
     *
     * @param {string|string[]} relations
     * @param {boolean} forceReload - Whether the already loaded relations should also be reloaded.
     *
     * @return {Promise<this>}
     */
    public async load(relations: string|string[], forceReload = false): Promise<this> {
        if (!Array.isArray(relations)) {
            relations = [relations];
        }

        const promises: any[] = [];

        for (const relation of relations) {
            if (!forceReload && this.relationLoaded(relation)) {
                continue;
            }

            if (!this.relationDefined(relation)) {
                throw new InvalidOffsetException('\'' + relation + '\' relationship has not been defined');
            }

            promises.push(
                ((this[relation] as CallableFunction)() as Model).get()
                    .then((data: Model|ModelCollection<Model>) => this.addRelation(relation, data))
            );
        }

        await Promise.all(promises);

        return Promise.resolve(this);
    }

    /**
     * Determine if the given relation is loaded.
     *
     * @param {string} key
     */
    public relationLoaded(key: string): boolean {
        return this.loadedRelations().includes(key);
    }

    /**
     * Get an array of loaded relation names.
     *
     * @return {string[]}
     */
    public loadedRelations(): string[] {
        return Object.keys(this.relations);
    }

    /**
     * Get the specified relationship.
     *
     * @param {string} name
     *
     * @return {Model|ModelCollection}
     */
    public getRelation(name: string): Model | ModelCollection<Model> {
        if (this.relationDefined(name)) {
            if (!this.relations[name]) {
                throw new LogicException(
                    'Trying to access the \'' + name + '\' relationship before it has been loaded'
                );
            }

            return this.relations[name];
        }

        throw new InvalidOffsetException('\'' + name + '\' relationship has not been defined');
    }

    /**
     * Assert whether the relation has been defined on this instance.
     *
     * @param {string} name
     * @protected
     *
     * @return {boolean}
     */
    // todo - update to protected
    public relationDefined(name: string): boolean {
        if (this[name] instanceof Function) {
            const value = (this[name] as CallableFunction)();
            const methodDefinition = Reflect.getOwnPropertyDescriptor(this, name);

            if (value instanceof HasRelations && methodDefinition) {
                const regex = RegExp('/return this.(belongsTo|belongsToMany|hasOne|HasMany|morphs)\\(', 'g');

                return !!regex.exec(String(methodDefinition.value))?.length;
            }
        }

        return false;
    }

    /**
     * Parse the given data into a related model class
     * and add the relation to this instance.
     *
     * @param {string} name
     * @param {Model|ModelCollection|object|object[]} value
     *
     * @return this
     */
    public addRelation(
        name: string,
        value: Record<string, any>|Record<string, any>[]|Model|ModelCollection<Model>
    ): this {
        if (!this.relationDefined(name)) {
            throw new LogicException('Attempted to add an undefined relation: \'' + name + '\'');
        }
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const modelCollectionConstructor: new() => ModelCollection<Model> = require('../ModelCollection');

        if (value instanceof HasRelations
            || (<typeof ModelCollection> modelCollectionConstructor).isModelCollection(value)
        ) {
            this.relations[name] = value;

            return this;
        }

        const relatedModel: Model = (this[name] as CallableFunction)();
        let relation: ModelCollection<Model>|Model;

        // set up the relations by calling the constructor of the related models
        if (Array.isArray(value)) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const collection = new modelCollectionConstructor();

            value.forEach(modelData => collection.push(new (<typeof Model> relatedModel.constructor)(modelData)));
            relation = collection;
        } else {
            relation = new (<typeof Model> relatedModel.constructor)(value);
        }

        this.relations[name] = relation;

        return this;
    }

    /**
     * Guess the foreign key name that would be used to reference this model.
     *
     * @return {string}
     */
    public getForeignKey(): string {
        return (this as unknown as Model).getName().snake() + '_' + (this as unknown as Model).getKeyName();
    }

    /**
     * Set the endpoint to a nested url structure.
     *
     * @param {Model|Model[]} models
     *
     * @return this
     */
    public for(models: Model[]|Model): this {// todo - in the same breath set the relation ?
        if (!Array.isArray(models)) {
            models = [models];
        }

        let endpoint = '';

        // todo - what if morphs relation?
        models.forEach((model: Model) => {
            endpoint += model.getEndpoint() + '/' + String(model.getKey()) + '/';
        });

        this.setEndpoint(endpoint + this.getEndpoint());

        return this;
    }

    /**
     * Instantiate a new belongs to relationship.
     *
     * @param {Model} related
     * @param {string} foreignKey
     *
     * @return {Model}
     */
    public belongsTo(related: new() => Model, foreignKey?: string): Model {
        const relatedModel = new related();
        const foreignKeyValue = this.getAttribute(this.foreignKey);
        foreignKey = foreignKey ?? relatedModel.getForeignKey();

        if (relatedModel.relationDefined((this as unknown as Model).getName().toLowerCase())) {
            relatedModel.addRelation((this as unknown as Model).getName().toLowerCase(), this);
        }

        if (!foreignKeyValue) {
            throw new LogicException(
                (this as unknown as Model).getName() + ' doesn\'t have ' + foreignKey + ' defined.'
            );
        }

        return relatedModel.setEndpoint(relatedModel.getEndpoint().finish('/') + String(foreignKeyValue));
    }

    /**
     * Instantiate a new belongs to relationship.
     *
     * @param {Model} related
     *
     * @return {Model}
     */
    // public belongsToMany(related: new() => Model): BelongsToMany {
    //     return new BelongsToMany(this as unknown as Model, related);
    // }

    /**
     * Instantiate a new has one relationship.
     *
     * @param {Model} related
     *
     * @return {Model}
     */
    // public hasOne(related: new() => Model): HasOne {
    //     return new HasOne(this as unknown as Model, related);
    // }

    /**
     * Instantiate a new has many relationship.
     *
     * @param {Model} related
     *
     * @return {Model}
     */
    // public hasMany(related: new() => Model): HasMany {
    //     return new HasMany(this as unknown as Model, related);
    // }

    /**
     * Instantiate a new polymorphic relationship.
     *
     * @param {Model} related
     * @param {string?} morphName
     *
     * @return {Model}
     */
    // public morphs(related: new() => Model, morphName?: string): Polymorphic {
    //     return new Polymorphic(this as unknown as Model, related, morphName);
    // }

    /**
     * Get the polymorphic column names.
     *
     * @param {string} name
     */
    protected getMorphs(name: string): Record<'id'|'type', string> {
        return { id: name + '_id', type: name + '_type' };
    }
}
