import ModelCollection from './ModelCollection';
import type Model from './Model';
import type { MaybeArray } from '../Support/type';

type Ancestralised<
    T extends Model,
    CT extends string = 'children'
> = T & { [key in CT]: ModelCollection<Ancestralised<T, CT>> };

export default class AncestryCollection<
    T extends Model,
    CT extends string = 'children'
> extends ModelCollection<Ancestralised<T, CT>> {
    /**
     * The name of the key that will be set when arranging the items in a tree structure.
     */
    public static depthName = 'depth';

    /**
     * The name of the attribute that includes the related models.
     *
     * @protected
     */
    protected childrenRelation: CT;

    /**
     * @param models - The models already arranged in an ancestry tree format.
     * @param childrenRelation - The key that will include descendants.
     *
     */
    protected constructor(
        models?: MaybeArray<Ancestralised<T, CT>>,
        childrenRelation: CT = 'children' as CT
    ) {
        super(models);
        this.childrenRelation = childrenRelation;
    }

    /**
     * Arrange the items in an ancestry tree format.
     *
     * @param models - The ModelCollection to sort.
     * @param parentKey - The key that identifies the parent's id.
     * @param childrenRelation - The key that will include descendants.
     *
     * @return {AncestryCollection}
     */
    public static treeOf<ST extends Model, CT extends string = 'children'>(
        models: ModelCollection<ST> | ST[],
        parentKey = 'parentId',
        childrenRelation: CT = 'children' as CT
    ): AncestryCollection<ST, CT> {
        const buildModelsRecursive = (
            modelItems: ST[],
            parent?: ST,
            depth = 0
        ): Ancestralised<ST, CT>[] => {
            const modelArray: Ancestralised<ST, CT>[] = [];

            modelItems.forEach(model => {
                // if this is a child, but we are looking for a top level
                if (!parent && model.getAttribute(parentKey)) {
                    return;
                }

                // if this is a child, but this child doesn't belong to this parent
                if (parent && model.getAttribute(parentKey) !== parent.getKey()) {
                    return;
                }

                model.setAttribute(this.depthName, depth)
                    .syncOriginal(this.depthName)
                    .setAttribute(
                        childrenRelation,
                        // by this filter we eventually will run out of items on the individual branches
                        buildModelsRecursive(modelItems.filter(m => m.getKey() !== model.getKey()), model, depth + 1)
                    );

                modelArray.push(model as Ancestralised<ST, CT>);
            });

            return modelArray;
        };

        return new AncestryCollection(
            buildModelsRecursive(Array.isArray(models) ? models : models.toArray()),
            childrenRelation
        );
    }

    /**
     * Return all the models in a single level with no children set.
     *
     * @return {ModelCollection}
     */
    public flatten(): ModelCollection<T> {
        const getModelsRecursive = (models: T[]): T[] => {
            const modelArray: T[] = [];

            models.forEach(model => {
                const children = (model.getAttribute(this.childrenRelation) ?? []) as ModelCollection<T> | T[];

                model.setAttribute(this.childrenRelation, []);
                modelArray.push(model);

                if (children.length) {
                    modelArray.push(...getModelsRecursive(
                        ModelCollection.isModelCollection<T>(children) ? children.toArray() : children
                    ));
                }
            });

            return modelArray.map(
                m => m.deleteAttribute((this.constructor as typeof AncestryCollection).depthName)
                    .syncOriginal((this.constructor as typeof AncestryCollection).depthName)
            );
        };

        return new ModelCollection(getModelsRecursive(this.toArray()));
    }

    /**
     * All the models that do not have any children.
     *
     * @return {ModelCollection}
     */
    public leaves(): ModelCollection<T> {
        const getLeaves = (models: T[]): T[] => {
            const leaves: T[] = [];

            models.forEach(model => {
                const children = model.getAttribute(this.childrenRelation) as ModelCollection<T> | T[] | undefined;

                if (!children?.length) {
                    leaves.push(model);
                }

                leaves.push(
                    ...getLeaves(ModelCollection.isModelCollection<T>(children) ? children.toArray() : children!)
                );
            });

            return leaves;
        };

        return new ModelCollection(getLeaves(this.toArray()));
    }

    /**
     * Asserts whether the given value
     * is an instance of AncestryCollection.
     *
     * @param value
     *
     * @return {boolean}
     */
    public static isAncestryCollection<M extends Model>(value: any): value is AncestryCollection<M> {
        return this.isModelCollection(value) && value instanceof AncestryCollection;
    }
}
