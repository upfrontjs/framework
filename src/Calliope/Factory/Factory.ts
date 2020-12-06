import type { Attributes } from '../Concerns/HasAttributes';
import type Model from '../Model';
import type ModelCollection from '../ModelCollection';
import Config from "../../Support/Config";

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

export default class Factory<T extends Model> implements FactoryHooks<T> {
    [method: string]: CallableFunction;

    /**
     * The instance of the randomisation library if set.
     */
    random?: any = new Config().get('randomDataGenerator');

    /**
     * Define the model's default attributes.
     *
     * @param {Model} _emptyModel - an empty instance of the target model.
     * @param {number} _loopIndex - the index of the current loop.
     *
     * @return {object}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public definition(_emptyModel: T, _loopIndex: number): Attributes {
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
