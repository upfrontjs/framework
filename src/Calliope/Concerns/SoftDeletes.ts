import HasTimestamps from './HasTimestamps';
import type Model from '../Model';

export default class SoftDeletes extends HasTimestamps {
    /**
     * The name of the deleted at attribute.
     * @type {string}
     *
     * @protected
     */
    protected static readonly deletedAt = 'deleted_at';

    /**
     * Indicates if the model should expect timestamps.
     *
     * @type {boolean}
     */
    protected readonly softDeletes: boolean = true;

    /**
     * Determine if the model instance has been soft-deleted.
     *
     * @return {boolean}
     */
    public trashed(): boolean {
        return !!this.getAttribute(this.getDeletedAtColumn());
    }

    /**
     * Get the name of the deleted at attribute.
     *
     * @return {string}
     */
    getDeletedAtColumn(): string {
        return SoftDeletes.deletedAt[this.attributeCasing]();
    }

    /**
     * Determine if the model uses soft deletes timestamp.
     *
     * @return {boolean}
     */
    public usesSoftDeletes(): boolean {
        return this.timestamps;
    }

    /**
     * Delete the model.
     *
     * @param {object=} data
     *
     * @return {Promise<boolean>}
     */
    public async delete(data?: Record<string, unknown>): Promise<Model> {
        if (!this.usesSoftDeletes()) {
            return super.delete(data);
        }

        if (!data) {
            data = {};
        }

        return super.delete({
            ...data,
            [this.getDeletedAtColumn()]: new Date().toISOString()
        }).then(data => {
            if (!data.getAttribute(this.getDeletedAtColumn())) {
                data.setAttribute(this.getDeletedAtColumn(), new Date().toISOString());
            }

            return data;
        });
    }

    /**
     * Set the deleted at column to null on remote.
     *
     * @return {Promise<this>}
     */
    public async restore(): Promise<Model> {
        if (!this.usesSoftDeletes()) {
            return Promise.resolve(this as unknown as Model);
        }

        return this.patch({
            [this.getDeletedAtColumn()]: null
        });
    }
}
