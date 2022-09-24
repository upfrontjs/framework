import type Model from '../../Calliope/Model';
import type Factory from '../../Calliope/Factory/Factory';
import FactoryBuilder from '../../Calliope/Factory/FactoryBuilder';

/**
 * Return the Factory builder.
 *
 * @param {Model} modelConstructor
 * @param {number} amount
 *
 * @return {Factory}
 */
export default function factory<T extends Model, F extends Factory<T> = Factory<T>>(
    modelConstructor: new () => T,
    amount = 1
): FactoryBuilder<T, F> {
    return new FactoryBuilder<T, F>(modelConstructor).times(amount);
}
