import ModelCollection from '../ModelCollection';
import type Model from '../Model';
import LogicException from '../../Exceptions/LogicException';
import CallsApi from './CallsApi';
import InvalidOffsetException from '../../Exceptions/InvalidOffsetException';
import type { Attributes } from './HasAttributes';
import Collection from '../../Support/Collection';
import InvalidArgumentException from '../../Exceptions/InvalidArgumentException';
import finish from '../../Support/string/finish';
import plural from '../../Support/string/plural';
import snake from '../../Support/string/snake';
import start from '../../Support/string/start';
import { cloneDeep } from 'lodash';
import type { MaybeArray } from '../../Support/type';

type Relation = 'belongsTo' | 'belongsToMany' | 'hasMany' | 'hasOne' | 'morphMany' | 'morphOne' | 'morphTo';
type MorphToCallback<
    MT extends HasRelations,
    T extends Model = Model
> = (self: MT, relatedData: Attributes<T>) => typeof Model;

export default class HasRelations extends CallsApi {
    /**
     * The loaded relations for the model.
     * The keys do not include the relation prefixes.
     *
     * @protected
     */
    protected relations: Record<string, (Model | ModelCollection<Model>)> = {};

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
     * The key name of the parent of this model which was
     * instantiated from a hasOne or hasMany relation.
     * This is used to remove the where query when saving
     * a new entity like `parent.$child().save({});`
     *
     * @protected
     */
    protected hasOneOrManyParentKeyName: string | undefined;

    /**
     * Load a relationships from remote.
     *
     * @param {string|string[]} relations
     * @param {boolean} forceReload - Whether the already loaded relations should also be reloaded.
     *
     * @return {Promise<this>}
     */
    public async load(relations: MaybeArray<string>, forceReload = false): Promise<this> {
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
            return this;
        }

        if (relations.length === 1) {
            const relation = await
            ((this[start(relations[0]!, this.relationMethodPrefix)] as CallableFunction)() as Model)
                .get();

            this.addRelation(relations[0]!, relation);

            return this;
        }

        const returnedRelations = (
            await (this as unknown as Model)
                .with(relations)
                .find(((this as unknown as Model)).getKey()!)
        )
            .getRelations();

        Object.keys(returnedRelations).forEach(returnedRelation => {
            this.addRelation(returnedRelation, returnedRelations[returnedRelation]!);
        });

        return this;
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
    public getRelation<T extends Model>(name: string): ModelCollection<T> | T {
        name = this.removeRelationPrefix(name);

        if (!this.relationDefined(name)) {
            throw new InvalidArgumentException('\'' + name + '\' relationship is not defined.');
        }

        if (!this.relations[name]) {
            throw new LogicException(
                'Trying to access the \'' + name + '\' relationship before it is loaded.'
            );
        }

        return cloneDeep(this.relations[name]!) as ModelCollection<T> | T;
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
        name = start(name, this.relationMethodPrefix);

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
     * @return {Relation}
     */
    protected getRelationType(name: string): Relation {
        name = start(name, this.relationMethodPrefix);
        const model = (this[name] as CallableFunction)() as Model & { _relationType?: Relation };

        if (!model._relationType) {
            throw new LogicException('\'' + name + '\' relation is not using any of the expected relation types.');
        }

        return model._relationType;
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
    public addRelation<T extends Model>(
        name: string,
        value: Collection<Attributes>
        | Collection<T>
        | MaybeArray<Attributes>
        | MaybeArray<T>
        | ModelCollection<T>
    ): this {
        name = this.removeRelationPrefix(name);

        if (!this.relationDefined(name)) {
            throw new LogicException(
                'Attempted to add an undefined relation: \'' + name + '\'.'
            );
        }

        const relationType = this.getRelationType(name);
        const isSingularRelationType = ['belongsTo', 'hasOne', 'morphOne', 'morphTo'].includes(relationType);
        const isModelArray = Array.isArray(value) && value.every(entry => entry instanceof HasRelations);
        /**
         * Callback acting as user guard for collection of models.
         * ModelCollection is a subclass of Collection.
         */
        const isCollectionWithModels = (val: any): val is Collection<T> =>  Collection.isCollection(val)
            && val.every(entry => entry instanceof HasRelations);

        if (value instanceof HasRelations || isCollectionWithModels(value) || isModelArray) {
            if (isSingularRelationType && (isCollectionWithModels(value) || isModelArray)) {
                throw new InvalidArgumentException(
                    '\'' + name + '\' is a singular relation, received type: \'' + value.constructor.name + '\'.'
                );
            }

            if (isCollectionWithModels(value) && !ModelCollection.isModelCollection(value)) {
                value = new ModelCollection(value.toArray());
            }

            if (isModelArray) {
                value = new ModelCollection(value as T[]);
            }

            if (value instanceof HasRelations) {
                if (!isSingularRelationType) {
                    value = new ModelCollection([value as T]);
                } else {
                    if (relationType === 'belongsTo') {
                        // set attribute to ensure sync between the foreign key and the given value
                        this.setAttribute(value.guessForeignKeyName(), (value as T).getKey());
                    }
                }
            }

            this.relations[name] = value as Model | ModelCollection<Model>;
            this.createDescriptor(name);

            return this;
        }

        let relatedCtor = ((this[start(name, this.relationMethodPrefix)] as CallableFunction)() as T)
            .constructor as typeof Model;
        let relation: Model | ModelCollection<Model>;

        // set up the relations by calling the constructor of the related models
        if (Array.isArray(value) || Collection.isCollection<Attributes>(value)) {
            if (isSingularRelationType) {
                throw new InvalidArgumentException(
                    '\'' + name + '\' is a singular relation, received type: \''
                    + (Array.isArray(value) ? Array.name : Collection.name) + '\'.'
                );
            }

            const collection = new ModelCollection;

            value.forEach(modelData => collection.push(relatedCtor.make(modelData)));
            relation = collection;
        } else {
            const model = relatedCtor.make(value);

            if (relationType === 'belongsTo') {
                // set attribute to ensure sync between the foreign key and the given value
                this.setAttribute(model.guessForeignKeyName(), model.getKey());
            }

            if (isSingularRelationType) {
                if (relationType === 'morphTo') {
                    let cb = this.morphToCb as MorphToCallback<this> | undefined;

                    if (!cb) {
                        const modelWithCb = (this[
                            start(name, this.relationMethodPrefix)
                        ] as CallableFunction)() as this;

                        if (!modelWithCb.morphToCb) {
                            throw new InvalidArgumentException('Called morphTo relation without providing a callback.');
                        }

                        cb = modelWithCb.morphToCb as MorphToCallback<this>;
                    }

                    if (typeof cb !== 'function') {
                        throw new InvalidArgumentException(
                            'The morphTo relation was called with invalid argument type.'
                        );
                    }

                    relatedCtor = cb(this, value);
                    relation = relatedCtor.make(value);
                    delete this.morphToCb;
                } else {
                    relation = model;
                }
            } else {
                relation = new ModelCollection([model]);
            }
        }

        this.relations[name] = relation as Model;
        this.createDescriptor(name);

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

        if (Object.getOwnPropertyDescriptor(this, name) // it is on this object
            && !(this[name] instanceof Function) // it isn't a function
            && this.relationDefined(name) // it has the corresponding relation method definition
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
        return cloneDeep(this.relations);
    }

    /**
     * Guess the foreign key name that would be used to reference this model.
     *
     * @return {string}
     */
    public guessForeignKeyName(): string {
        return this.setStringCase(
            snake((this as unknown as Model).getName()).toLowerCase()
            + '_'
            + (this as unknown as Model).getKeyName()
        );
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
    ): asserts model is T & { _relationType: Readonly<Relation> } {
        Object.defineProperty(model, '_relationType', {
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
    public for(models: MaybeArray<Model | (new () => Model)>): this {
        models = Array.isArray(models) ? models : [models];

        this.resetEndpoint();
        let endpoint = '';

        models.forEach((model) => {
            if (!(model instanceof HasRelations)) {
                model = new model;
            }

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
        foreignKey = foreignKey ?? relatedModel.guessForeignKeyName();
        const foreignKeyValue = this.getAttribute(foreignKey);

        if (!foreignKeyValue) {
            throw new LogicException(
                '\'' + (this as unknown as Model).getName() + '\' doesn\'t have \'' + foreignKey + '\' defined.'
            );
        }

        HasRelations.configureRelationType(relatedModel, 'belongsTo');

        return relatedModel.setEndpoint(finish(relatedModel.getEndpoint(), '/') + String(foreignKeyValue));
    }

    /**
     * Set the endpoint on the correct model for querying.
     *
     * @param {Model} related
     * @param {string=} relationName - The name of the relation on the backend.
     *
     * @return {Model}
     */
    public belongsToMany<T extends Model>(related: new() => T, relationName?: string): T {
        const relatedModel = new related();
        HasRelations.configureRelationType(relatedModel, 'belongsToMany');
        relationName = relationName ?? plural((this as unknown as Model).getName()).toLowerCase();

        return relatedModel.where(
            relationName + '.' + (this as unknown as Model).getKeyName(),
            '=',
            (this as unknown as Model).getKey()
        );
    }

    /**
     * Set the endpoint on the correct model for querying.
     *
     * @param {Model} related
     * @param {string=} foreignKey
     *
     * @return {Model}
     */
    public hasOne<T extends Model>(related: new() => T, foreignKey: string = this.guessForeignKeyName()): T {
        const relatedModel = new related();

        HasRelations.configureRelationType(relatedModel, 'hasOne');
        relatedModel.setAttribute(foreignKey, (this as unknown as Model).getKey());
        relatedModel.hasOneOrManyParentKeyName = foreignKey;

        return relatedModel.where(foreignKey, '=', (this as unknown as Model).getKey());
    }

    /**
     * Set the endpoint on the correct model for querying.
     *
     * @param {Model} related
     * @param {string=} foreignKey
     *
     * @return {Model}
     */
    public hasMany<T extends Model>(related: new() => T, foreignKey: string = this.guessForeignKeyName()): T {
        const relatedModel = new related();

        HasRelations.configureRelationType(relatedModel, 'hasMany');
        relatedModel.setAttribute(foreignKey, (this as unknown as Model).getKey());
        relatedModel.hasOneOrManyParentKeyName = foreignKey;

        return relatedModel.where(foreignKey, '=', (this as unknown as Model).getKey());
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
     * @param cb - Callback that returns a model that this morphs to.
     * @param relationName - The name of the relation to be called. E.g.: `'commentable'`
     *
     * @example
     * public $contractable(): this {
     *     return this.morphTo<Team | User>((self, _data) => {
     *         return self.contractableType === 'team' ? Team : User;
     *     });
     * }
     *
     * @return {Model}
     */
    public morphTo<T extends Model>(
        cb: MorphToCallback<this, T>,
        relationName?: string
    ): this {
        relationName = relationName ?? this.getMorphs().id.slice(0, - '_id'.length);

        const thisModel = new (this.constructor as typeof Model)().with([relationName]);

        HasRelations.configureRelationType(thisModel, 'morphTo');

        Object.defineProperty(thisModel, 'morphToCb', {
            configurable: true,
            enumerable: false,
            writable: false,
            value: cb
        });

        return thisModel as unknown as this;
    }

    /**
     * Get the polymorphic column names.
     *
     * @param {string=} name
     */
    protected getMorphs(name?: string): Record<'id' | 'type', string> {
        name = name ?? finish((this as unknown as Model).getName().toLowerCase(), 'able');

        return { id: name + '_id', type: name + '_type' };
    }
}
