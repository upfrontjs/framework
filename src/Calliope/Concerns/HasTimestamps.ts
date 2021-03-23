import HasRelations from './HasRelations';
import type Model from '../Model';
import InvalidArgumentException from '../../Exceptions/InvalidArgumentException';
import { finish } from '../../Support/string';

export default class HasTimestamps extends HasRelations {
    /**
     * The name of the created at attribute.
     *
     * @type {string}
     *
     * @protected
     */
    protected static readonly createdAt: string = 'created_at';

    /**
     * The name of the updated at attribute.
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
    public getCreatedAtColumn(): string {
        return this.setStringCase(HasTimestamps.createdAt);
    }

    /**
     * Get the name of the updated at attribute.
     *
     * @return {string}
     */
    public getUpdatedAtColumn(): string {
        return this.setStringCase(HasTimestamps.updatedAt);
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
            return Promise.resolve(this);
        }

        // @ts-expect-error
        (this as unknown as Model).throwIfDoesntExists('touch');

        const updatedAt = this.getUpdatedAtColumn();

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
     * Refresh the timestamps only on the
     *
     * @return {Promise<this>}
     */
    public async freshTimestamps(): Promise<this> {
        if (!this.usesTimestamps()) {
            return Promise.resolve(this);
        }

        // @ts-expect-error
        (this as unknown as Model).throwIfDoesntExists('freshTimestamps');

        const createdAt = this.getCreatedAtColumn();
        const updatedAt = this.getUpdatedAtColumn();

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
}
