import HasRelations from './HasRelations';

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
