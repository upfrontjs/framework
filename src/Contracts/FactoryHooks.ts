import type Model from '../Calliope/Model';
import type ModelCollection from '../Calliope/ModelCollection';

/**
 * Interface typehints the possible hooks and states for factories.
 */
export default interface FactoryHooks<T extends Model> {
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
