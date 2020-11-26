import type ModelCollection from '../ModelCollection';
import type Model from '../Model';
import LogicException from '../../Exceptions/LogicException';
import CallsApi from './CallsApi';
import InvalidOffsetException from '../../Exceptions/InvalidOffsetException';
import type { Attributes } from './HasAttributes';

export default class HasRelations extends CallsApi {
    /**
     * The string all the relation methods expected to prefixed by.
     *
     * @protected
     *
     * @return {string}
     */
    protected get relationMethodPrefix(): string {
        return '$';
    }

    /**
     * Load a relationships from remote.
     *
     * @param {string|string[]} relations
     * @param {boolean} forceReload - Whether the already loaded relations should also be reloaded.
     *
     * @return {Promise<this>}
     */
    // todo - in tests mock the response from the fakeDB implemented by the config
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
                throw new InvalidOffsetException('\'' + relation + '\' relationship is not defined.');
            }

            promises.push(
                ((this[relation.start(this.relationMethodPrefix)] as CallableFunction)() as Model).get()
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
        return this.loadedRelationKeys().includes(key);
    }

    /**
     * Get an array of loaded relation names.
     *
     * @return {string[]}
     */
    public loadedRelationKeys(): string[] {
        return Object.keys(this.getRelations());
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
                    'Trying to access the \'' + name + '\' relationship before it is loaded.'
                );
            }

            return this.relations[name];
        }

        throw new InvalidOffsetException('\'' + name + '\' relationship is not defined.');
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
        name = name.start(this.relationMethodPrefix);
        if (this[name] instanceof Function) {
            const value = (this[name] as CallableFunction)();
            const methodDefinition = (this[name] as CallableFunction).toString();

            if (value instanceof HasRelations && methodDefinition) {
                const regex = RegExp(/return this.(belongsTo|belongsToMany|hasOne|hasMany|morphs)\(/, 'g');

                return !!regex.exec(methodDefinition)?.length;
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
        value: Attributes|Attributes[]|Model|ModelCollection<Model>
    ): this {
        if (!this.relationDefined(name)) {
            throw new LogicException(
                'Attempted to add an undefined relation: \'' + name.start(this.relationMethodPrefix) + '\'.'
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-member-access
        const modelCollectionConstructor: new() => ModelCollection<Model> = require('../ModelCollection').default;

        if (value instanceof HasRelations
            || (<typeof ModelCollection> modelCollectionConstructor).isModelCollection(value)
        ) {
            this.relations[name] = value;
            this.createDescriptors(name);

            return this;
        }

        const relatedModel: Model = (this[name.start(this.relationMethodPrefix)] as CallableFunction)();
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
        this.createDescriptors(name);

        return this;
    }

    /**
     * Remove the relation and its magic access if set.
     *
     * @param {string} name
     *
     * @return {this}
     */
    public removeRelation(name: string): this {
        delete this.relations[name];

        if (Object.getOwnPropertyDescriptor(this, name)
            && this.relationDefined(name)
            && !(this[name] instanceof Function)
        ) {
            delete this[name];
        }

        return this;
    }

    /**
     * Get all the relations.
     *
     * @return {object}
     */
    public getRelations(): Record<string, (Model | ModelCollection<Model>)> {
        return this.relations;
    }

    /**
     * Guess the foreign key name that would be used to reference this model.
     *
     * @return {string}
     */
    public getForeignKeyName(): string {
        return ((this as unknown as Model).getName().snake().toLowerCase()
            + '_'
            + (this as unknown as Model).getKeyName())[this.attributeCasing]();
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
     * Set the endpoint on the correct model for querying.
     *
     * @param {Model} related
     * @param {string=} foreignKey
     *
     * @return {Model}
     */
    public belongsTo<T extends Model>(related: new() => T, foreignKey?: string): T {
        const relatedModel = new related();
        foreignKey = foreignKey ?? relatedModel.getForeignKeyName();
        const foreignKeyValue = this.getAttribute(foreignKey);

        if (!foreignKeyValue) {
            throw new LogicException(
                (this as unknown as Model).getName() + ' doesn\'t have \'' + foreignKey + '\' defined.'
            );
        }

        if (relatedModel.relationDefined((this as unknown as Model).getName().toLowerCase())) {
            relatedModel.addRelation((this as unknown as Model).getName().toLowerCase(), this);
        }

        return relatedModel.setEndpoint(relatedModel.getEndpoint().finish('/') + String(foreignKeyValue));
    }

    /**
     * Set the endpoint on the correct model for querying.
     *
     * @param {Model} related
     * @param {string=} foreignKey
     *
     * @return {Model}
     */
    public belongsToMany<T extends Model>(related: new() => T, foreignKey?: string): T {
        const relatedModel = new related();
        foreignKey = foreignKey ?? relatedModel.getForeignKeyName();
        const foreignKeyValue = this.getAttribute(this.foreignKey);

        if (relatedModel.relationDefined((this as unknown as Model).getName().toLowerCase().plural())) {
            relatedModel.addRelation((this as unknown as Model).getName().toLowerCase().plural(), this);
        }

        if (!foreignKeyValue) {
            throw new LogicException(
                (this as unknown as Model).getName() + ' doesn\'t have ' + foreignKey + ' defined.'
            );
        }

        return relatedModel.whereKey(String(foreignKeyValue));
    }

    /**
     * Set the endpoint on the correct model for querying.
     *
     * @param {Model} related
     * @param {string=} foreignKey
     *
     * @return {Model}
     */
    public hasOne<T extends Model>(related: new() => T, foreignKey?: string): T {
        const relatedModel = new related();

        if (relatedModel.relationDefined((this as unknown as Model).getName().toLowerCase())) {
            relatedModel.addRelation((this as unknown as Model).getName().toLowerCase(), this);
        }

        return relatedModel.where(foreignKey ?? this.getForeignKeyName(), '=', (this as unknown as Model).getKey());
    }

    /**
     * Set the endpoint on the correct model for querying.
     *
     * @param {Model} related
     * @param {string=} foreignKey
     *
     * @return {Model}
     */
    public hasMany<T extends Model>(related: new() => T, foreignKey?: string): T {
        const relatedModel = new related();

        if (relatedModel.relationDefined((this as unknown as Model).getName().toLowerCase().plural())) {
            relatedModel.addRelation((this as unknown as Model).getName().toLowerCase().plural(), this);
        }

        return relatedModel.where(foreignKey ?? this.getForeignKeyName(), '=', (this as unknown as Model).getKey());
    }

    /**
     * Set the endpoint on the correct model for querying.
     *
     * @param {Model} related
     * @param {string=} morphName
     *
     * @return {Model}
     */
    public morphs<T extends Model>(related: new() => T, morphName?: string): T {
        const relatedModel = new related();

        if (relatedModel.relationDefined((this as unknown as Model).getName().toLowerCase().plural())) {
            relatedModel.addRelation((this as unknown as Model).getName().toLowerCase().plural(), this);
        }

        const morphs = relatedModel.getMorphs();

        return relatedModel
            .where(morphs.type, '=', morphName ?? (this as unknown as Model).getName())
            .where(morphs.id, '=', (this as unknown as Model).getKey());
    }

    /**
     * Get the polymorphic column names.
     *
     * @param {string=} name
     */
    protected getMorphs(name?: string): Record<'id'|'type', string> {
        name = name ?? (this as unknown as Model).getName().toLowerCase() + 'able';

        return { id: name + '_id', type: name + '_type' };
    }
}
