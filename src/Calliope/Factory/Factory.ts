import type { Attributes } from '../Concerns/HasAttributes';
import type Model from '../Model';
import type ModelCollection from '../ModelCollection';

interface FactoryHooks<T extends Model> {
    /**
     * The factory hook to be called where the value might be changed.
     *
     * @param {Model|ModelCollection<Model>} modelOrCollection
     */
    afterMaking?(modelOrCollection: T|ModelCollection<T>): void;

    /**
     * The factory hook to be called where the value might be changed.
     *
     * @param {Model|ModelCollection<Model>} modelOrCollection
     */
    afterCreating?(modelOrCollection: T|ModelCollection<T>): void;

    /**
     * The class can be indexed by strings
     */
    [method: string]: CallableFunction | undefined;
}

export default abstract class Factory<T extends Model> implements FactoryHooks<T> {
    [method: string]: CallableFunction;

    /**
     * define the model's default attributes.
     *
     * @return {object}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public definition(_emptyModel: T): Attributes {
        return {};
    }

    /**
     * Get the name of the class.
     *
     * @return {string}
     */
    public getClassName(): string {
        return this.constructor.name;
    }
}
