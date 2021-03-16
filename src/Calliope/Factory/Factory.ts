import type { Attributes } from '../Concerns/HasAttributes';
import type Model from '../Model';
import GlobalConfig from '../../Support/GlobalConfig';
import type FactoryHooks from '../../Contracts/FactoryHooks';

export default class Factory<T extends Model> implements FactoryHooks<T> {
    [method: string]: CallableFunction;

    /**
     * The instance of the randomisation library if set.
     */
    public random? = new GlobalConfig().get('randomDataGenerator');

    /**
     * Define the model's default attributes.
     *
     * @param {Model} _emptyModel - an empty instance of the target model.
     * @param {number} _loopIndex - the index of the current loop.
     *
     * @return {Attributes}
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
