import type { Attributes } from '../Concerns/HasAttributes';
import type Model from '../Model';
import type ModelCollection from '../ModelCollection';

interface FactoryHooks {
    /**
     * The factory hook to be called where the value might be changed.
     *
     * @param {Model|ModelCollection<Model>} models
     */
    afterMaking?(models: Model|ModelCollection<Model>): void;

    /**
     * The factory hook to be called where the value might be changed.
     *
     * @param {Model|ModelCollection<Model>} models
     */
    afterCreating?(models: Model|ModelCollection<Model>): void;

    /**
     * The class can be indexed by strings
     */
    [method: string]: CallableFunction | undefined;
}

export default abstract class Factory implements FactoryHooks {
    [method: string]: CallableFunction;

    /**
     * define the model's default attributes.
     *
     * @return {object}
     */
    public abstract definition(model: Model): Attributes;

    /**
     * Get the name of the class.
     *
     * @return {string}
     */
    public getClassName(): string {
        return this.constructor.name;
    }
}
