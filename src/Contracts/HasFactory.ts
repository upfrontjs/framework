import type Factory from '../Calliope/Factory/Factory';
import type Model from '../Calliope/Model';

/**
 * Interface to typehint the factory method signature.
 */
export default interface HasFactory {
    /**
     * The method responsible for returning the instantiated model factory class.
     *
     * @return {Factory}
     */
    factory?: <T extends Factory<Model>>() => T;

    /**
     * This interface should have a property in common with implementer.
     * And FactoryBuilder among others depends on the getName method.
     */
    getName: () => string;
}
