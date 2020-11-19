import HasTimestamps from './HasTimestamps';

export default class SoftDeletes extends HasTimestamps {
    /**
     * The name of the deleted at attribute.
     * @type {string}
     *
     * @protected
     */
    protected static readonly DELETED_AT = 'deleted_at';

    /**
     * Indicates if the model should expect timestamps.
     *
     * @type {boolean}
     */
    protected readonly softDeletes = true;

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
        return SoftDeletes.DELETED_AT;
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
     * @param {object?} data
     *
     * @return {Promise<boolean>}
     */
    async delete(data?: Record<string, unknown>): Promise<boolean> {
        return super.delete(data).then(boolean => {
            if (boolean) {
                // todo - a date time string, the format of which is defined on the castAttributes
                this.setAttribute(this.getDeletedAtColumn(), new Date());
            }

            return boolean;
        });
    }
}
