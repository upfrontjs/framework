import HasRelations from './HasRelations';

export default class HasTimestamps extends HasRelations {
    /**
     * The name of the created at attribute.
     *
     * @type {string}
     *
     * @protected
     */
    protected static readonly CREATED_AT = 'created_at';

    /**
     * The name of the updated at attribute.
     *
     * @type {string}
     *
     * @protected
     */
    protected static readonly UPDATED_AT = 'updated_at';

    /**
     * Indicates if the model should expect timestamps.
     *
     * @type {boolean}
     */
    protected readonly timestamps = true;

    /**
     * Get the name of the created at attribute.
     *
     * @return {string}
     */
    public getCreatedAtColumn(): string {
        return HasTimestamps.CREATED_AT;
    }

    /**
     * Get the name of the updated at attribute.
     *
     * @return {string}
     */
    public getUpdatedAtColumn(): string {
        return HasTimestamps.UPDATED_AT;
    }

    // public touch() {
    //     if (!this.usesTimestamps()) {
    //         return;
    //     }
    // }

    /**
     * Determine if the model uses timestamps.
     *
     * @return {boolean}
     */
    public usesTimestamps(): boolean {
        return this.timestamps;
    }

    // public freshTimestamps()
    // public touch
}
