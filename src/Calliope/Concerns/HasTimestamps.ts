import HasRelations from './HasRelations';
import type Model from '../Model';
import InvalidArgumentException from '../../Exceptions/InvalidArgumentException';
import { finish } from '../../Support/string';
import LogicException from '../../Exceptions/LogicException';

export default class HasTimestamps extends HasRelations {
    /**
     * The name of the created at attribute on the server side.
     *
     * @type {string}
     *
     * @protected
     */
    protected static readonly createdAt: string = 'created_at';

    /**
     * The name of the updated at attribute on the server side.
     *
     * @type {string}
     *
     * @protected
     */
    protected static readonly updatedAt: string = 'updated_at';

    /**
     * Indicates if the model should expect timestamps.
     *
     * @type {boolean}
     */
    protected readonly timestamps: boolean = true;

    /**
     * Get the name of the created at attribute.
     *
     * @return {string}
     */
    public getCreatedAtName(): string {
        return this.setStringCase((this.constructor as unknown as HasTimestamps).createdAt as string);
    }

    /**
     * Get the name of the updated at attribute.
     *
     * @return {string}
     */
    public getUpdatedAtName(): string {
        return this.setStringCase((this.constructor as unknown as HasTimestamps).updatedAt as string);
    }

    /**
     * Determine if the model uses timestamps.
     *
     * @return {boolean}
     */
    public usesTimestamps(): boolean {
        return this.timestamps;
    }

    /**
     * Update the timestamps on remote.
     *
     * @return {Promise<this>}
     */
    public async touch(): Promise<this> {
        if (!this.usesTimestamps()) {
            return this;
        }

        this.throwIfModelDoesntExistsWhenCalling('touch');

        const updatedAt = this.getUpdatedAtName();

        return this.setEndpoint(finish(this.getEndpoint(), '/') + String((this as unknown as Model).getKey()))
            .patch({ [updatedAt]: new Date().toISOString() })
            .then(model => {
                if (!(updatedAt in model)) {
                    throw new InvalidArgumentException('\'' + updatedAt + '\' is not found in the response model.');
                }

                return this.setAttribute(updatedAt, model.getAttribute(updatedAt)).syncOriginal(updatedAt);
            });
    }

    /**
     * Refresh the timestamps from remote.
     *
     * @return {Promise<this>}
     */
    public async freshTimestamps(): Promise<this> {
        if (!this.usesTimestamps()) {
            return this;
        }

        this.throwIfModelDoesntExistsWhenCalling('freshTimestamps');

        const createdAt = this.getCreatedAtName();
        const updatedAt = this.getUpdatedAtName();

        return this.select([createdAt, updatedAt])
            .whereKey((this as unknown as Model).getKey()!)
            .setEndpoint(finish(this.getEndpoint(), '/') + String((this as unknown as Model).getKey()))
            .get()
            .then(model => {
                if (!(createdAt in model)) {
                    throw new InvalidArgumentException('\'' + createdAt + '\' is not found in the response model.');
                }
                if (!(updatedAt in model)) {
                    throw new InvalidArgumentException('\'' + updatedAt + '\' is not found in the response model.');
                }

                return this.setAttribute(createdAt, (model as Model).getAttribute(createdAt))
                    .setAttribute(updatedAt, (model as Model).getAttribute(updatedAt))
                    .syncOriginal([createdAt, updatedAt]);
            });
    }

    /**
     * Throw an error if the model does not exist before calling the specified method.
     *
     * @param {string} methodName
     *
     * @protected
     *
     * @internal
     */
    protected throwIfModelDoesntExistsWhenCalling(methodName: string): void {
        if (!(this as unknown as Model).exists) {
            throw new LogicException(
                'Attempted to call ' + methodName + ' on \'' + (this as unknown as Model).getName()
                + '\' when it has not been persisted yet or it has been soft deleted.'
            );
        }
    }
}
