import type Factory from '../Calliope/Factory/Factory';
import type Model from '../Calliope/Model';

export default interface HasFactory {
    /**
     * The method responsible for returning the instantiated model factory class.
     *
     * @return {Factory}
     */
    factory?: () => Factory<Model>;

    /**
     * The implementer should allow indexing by string.
     */
    [factory: string]: (() => Factory<Model>) | undefined;
}
