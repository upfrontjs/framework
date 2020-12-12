import HasRelations from './HasRelations';
import type Model from '../Model';
import type { Attributes } from './HasAttributes';
import InvalidArgumentException from '../../Exceptions/InvalidArgumentException';

export default class HasTimestamps extends HasRelations {
    /**
     * The name of the created at attribute.
     *
     * @type {string}
     *
     * @protected
     */
    protected static readonly createdAt = 'created_at';

    /**
     * The name of the updated at attribute.
     *
     * @type {string}
     *
     * @protected
     */
    protected static readonly updatedAt = 'updated_at';

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
        return HasTimestamps.createdAt[this.attributeCasing]();
    }

    /**
     * Get the name of the updated at attribute.
     *
     * @return {string}
     */
    public getUpdatedAtColumn(): string {
        return HasTimestamps.updatedAt[this.attributeCasing]();
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
    public async touch(): Promise<Model> {
        if (!this.usesTimestamps()) {
            return Promise.resolve(this as unknown as Model);
        }

        return this.call('patch', {
            [this.getCreatedAtColumn()]: new Date().toISOString(),
            [this.getUpdatedAtColumn()]: new Date().toISOString()
        })
            .then((data: Attributes) => {
                return this.updateTimestampsFromResponse(data)
                    .syncOriginal([this.getCreatedAtColumn(), this.getUpdatedAtColumn()]) as unknown as Model;
            });
    }

    /**
     * Refresh the timestamps only on the
     *
     * @return {Promise<this>}
     */
    public async freshTimestamps(): Promise<Model> {
        if (!this.usesTimestamps()) {
            return Promise.resolve(this as unknown as Model);
        }

        return this.select([this.getCreatedAtColumn(), this.getUpdatedAtColumn()])
            .call('get').then((data: Attributes) => {
                return this.updateTimestampsFromResponse(data)
                    .syncOriginal([this.getCreatedAtColumn(), this.getUpdatedAtColumn()]) as unknown as Model;
            });
    }

    /**
     * Update this timestamps based on the response.
     *
     * @param {object} data
     *
     * @private
     *
     * @return {this}
     */
    private updateTimestampsFromResponse(data: Attributes): this {
        if (HasTimestamps.createdAt in data) {
            this.setAttribute(this.getCreatedAtColumn(), data[HasTimestamps.createdAt]);
        } else if (this.getCreatedAtColumn() in data) {
            this.setAttribute(this.getCreatedAtColumn(), data[this.getCreatedAtColumn()]);
        } else {
            throw new InvalidArgumentException(
                'No \'' + this.getCreatedAtColumn() + '\' or '
                + '\'' + HasTimestamps.createdAt +'\' attribute found on the response data.'
            );
        }

        if (HasTimestamps.updatedAt in data) {
            this.setAttribute(this.getUpdatedAtColumn(), data[HasTimestamps.updatedAt]);
        } else if (this.getUpdatedAtColumn() in data) {
            this.setAttribute(this.getUpdatedAtColumn(), data[this.getUpdatedAtColumn()]);
        } else {
            throw new InvalidArgumentException(
                'No \'' + this.getUpdatedAtColumn() + '\' or '
                + '\'' + HasTimestamps.updatedAt +'\' attribute found on the response data.'
            );
        }

        return this;
    }
}
