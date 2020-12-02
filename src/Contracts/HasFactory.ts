import type Factory from '../Calliope/Factory/Factory';

export default interface HasFactory {
    /**
     * The method responsible for returning the instantiated model factory class.
     *
     * @return {Factory}
     */
    factory?(): Factory;

    /**
     * The implementer should allow indexing by string.
     */
    [factory: string]: undefined | (() => Factory);
}
