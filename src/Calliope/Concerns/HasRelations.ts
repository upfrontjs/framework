import type ModelCollection from '../ModelCollection';
import type Model from '../Model';
import LogicException from '../../Exceptions/LogicException';
import CallsApi from './CallsApi';
import InvalidOffsetException from '../../Exceptions/InvalidOffsetException';
import type { Attributes } from './HasAttributes';
import type Collection from '../../Support/Collection';

type Relation = 'belongsTo'|'belongsToMany'|'hasOne'|'hasMany'|'morphTo'|'morphMany'|'morphOne';

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

        relations = relations.filter(relation => forceReload || !this.relationLoaded(relation));

        relations.forEach(relation => {
            if (!this.relationDefined(relation)) {
                throw new InvalidOffsetException('\'' + relation + '\' relationship is not defined.');
            }
        });

        if (!relations.length) {
            return Promise.resolve(this);
        }

        if (relations.length === 1) {
            const relation = await
            ((this[(relations[0] as string).start(this.relationMethodPrefix)] as CallableFunction)() as Model)
                .get() as Model;

            this.addRelation(relations[0] as string, relation);

            return Promise.resolve(this);
        }

        const returnedRelations = (
            await (this as unknown as Model).with(relations).find(((this as unknown as Model)).getKey())
        )
            .getRelations();

        Object.keys(returnedRelations).forEach(relation => {
            this.addRelation(relation, returnedRelations[relation] as Model | ModelCollection<Model>);
        });

        return Promise.resolve(this);
    }

    /**
     * Determine if the given relation is loaded.
     *
     * @param {string} name
     */
    public relationLoaded(name: string): boolean {
        return this.loadedRelationKeys().includes(this.removeRelationPrefix(name));
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
        name = this.removeRelationPrefix(name);

        if (this.relationDefined(name)) {
            if (!this.relations[name]) {
                throw new LogicException(
                    'Trying to access the \'' + name + '\' relationship before it is loaded.'
                );
            }

            return this.relations[name] as Model | ModelCollection<Model>;
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
    protected relationDefined(name: string): boolean {
        name = name.start(this.relationMethodPrefix);

        if (this[name] instanceof Function) {
            const value = (this[name] as CallableFunction)();

            return value instanceof HasRelations && !!this.getRelationType(name);
        }

        return false;
    }

    /**
     * Get the name of the relation type for the given relation.
     *
     * @param {string} name
     *
     * @protected
     *
     * @return {'belongsTo'|'belongsToMany'|'hasOne'|'hasMany'|'morphs'|'morphTo'|'morphMany'|'morphOne'}
     */
    private getRelationType(name: string): Relation {
        name = name.start(this.relationMethodPrefix);
        const model = (this[name] as CallableFunction)() as Model & { relationType: Relation };

        if (!model.relationType) {
            throw new LogicException('\'' + name + '\' relation is not using any of the expected relation types.');
        }

        return model.relationType;
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
        value: Attributes|Attributes[]|Collection<Attributes>|Model|ModelCollection<Model>
    ): this {
        name = this.removeRelationPrefix(name);

        if (!this.relationDefined(name)) {
            throw new LogicException(
                'Attempted to add an undefined relation: \'' + name + '\'.'
            );
        }

        const modelCollectionConstructor: new(models?: Model[]) => ModelCollection<Model>
            // eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-member-access
            = require('../ModelCollection').default;

        // todo - automagically set the relation id on this if possible?
        //    if its a belongsto or belongstomany

        if (value instanceof HasRelations
            || (<typeof ModelCollection> modelCollectionConstructor).isModelCollection(value)
        ) {
            if (value instanceof HasRelations
                && !['belongsTo', 'hasOne', 'morphOne'].includes(this.getRelationType(name))
            ) {
                value = new modelCollectionConstructor([value]);
            }

            this.relations[name] = value;
            this.createDescriptors(name);

            return this;
        }

        const relatedModel: Model = (this[name.start(this.relationMethodPrefix)] as CallableFunction)();
        let relation: ModelCollection<Model>|Model;

        // set up the relations by calling the constructor of the related models
        if (Array.isArray(value)) {
            const collection = new modelCollectionConstructor();

            value.forEach(modelData => collection.push(new (<typeof Model> relatedModel.constructor)(modelData)));
            relation = collection;
        } else {
            const model = new (<typeof Model> relatedModel.constructor)(value as Attributes);
            relation = ['belongsTo', 'hasOne', 'morphOne'].includes(this.getRelationType(name))
                ? model
                : new modelCollectionConstructor([model]);
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
        name = this.removeRelationPrefix(name);
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
     * Remove the prefix from the given string if set.
     *
     * @param {string} name
     *
     * @private
     *
     * @return {string}
     */
    private removeRelationPrefix(name: string): string {
        return name.startsWith(this.relationMethodPrefix) ? name.slice(this.relationMethodPrefix.length) : name;
    }

    /**
     * Add the relation type onto the model.
     *
     * @param {Model} model
     * @param {'belongsTo'|'belongsToMany'|'hasOne'|'hasMany'|'morphTo'|'morphMany'|'morphOne'} relationType
     *
     * @private
     *
     * @return {void}
     */
    private static configureRelationType<T extends Model>(
        model: T,
        relationType: Relation
    ): asserts model is T & { relationType: Relation } {
        Object.defineProperty(model, 'relationType', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: relationType
        });
    }

    /**
     * Set the endpoint to a nested url structure.
     *
     * @param {Model|Model[]} models
     *
     * @return this
     */
    public for(models: Model[]|Model): this {
        models = Array.isArray(models) ? models : [models];

        this.resetEndpoint();
        let endpoint = '';

        models.forEach((model: Model) => {
            endpoint += model.getEndpoint() + '/' + (model.getKey() ? String(model.getKey()) + '/' : '');
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
                '\'' + (this as unknown as Model).getName() + '\' doesn\'t have \'' + foreignKey + '\' defined.'
            );
        }

        HasRelations.configureRelationType(relatedModel, 'belongsTo');

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
        const foreignKeyValue = this.getAttribute(foreignKey);

        if (!foreignKeyValue) {
            throw new LogicException(
                '\'' + (this as unknown as Model).getName() + '\' doesn\'t have \'' + foreignKey + '\' defined.'
            );
        }

        HasRelations.configureRelationType(relatedModel, 'belongsToMany');

        return relatedModel.whereKey(foreignKeyValue);
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

        HasRelations.configureRelationType(relatedModel, 'hasOne');

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

        HasRelations.configureRelationType(relatedModel, 'hasMany');

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
    public morphMany<T extends Model>(related: new() => T, morphName?: string): T {
        const relatedModel = new related();
        const morphs = relatedModel.getMorphs();

        HasRelations.configureRelationType(relatedModel, 'morphMany');

        return relatedModel
            .where(morphs.type, '=', morphName ?? (this as unknown as Model).getName())
            .where(morphs.id, '=', (this as unknown as Model).getKey());
    }

    /**
     * Set the endpoint on the correct model for querying.
     *
     * @param {Model} related
     * @param {string=} morphName
     *
     * @return {Model}
     */
    public morphOne<T extends Model>(related: new() => T, morphName?: string): T {
        const relatedModel = new related();
        const morphs = relatedModel.getMorphs();

        HasRelations.configureRelationType(relatedModel, 'morphOne');

        return relatedModel
            .where(morphs.type, '=', morphName ?? (this as unknown as Model).getName())
            .where(morphs.id, '=', (this as unknown as Model).getKey());
    }

    /**
     * Add a constraint for the next query to return all relation.
     *
     * @return {Model}
     */
    public morphTo<T extends Model>(): T {
        const relatedModel = new (<typeof Model> this.constructor)().with(['*']) as T;

        HasRelations.configureRelationType(relatedModel, 'morphTo');

        return relatedModel;
    }

    /**
     * Get the polymorphic column names.
     *
     * @param {string=} name
     */
    protected getMorphs(name?: string): Record<'id'|'type', string> {
        name = name ?? (this as unknown as Model).getName().toLowerCase().finish('able');

        return { id: name + '_id', type: name + '_type' };
    }
}
