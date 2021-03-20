import HasTimestamps from './HasTimestamps';
import type Model from '../Model';
import LogicException from '../../Exceptions/LogicException';
import { finish } from '../../Support/string';

export default class SoftDeletes extends HasTimestamps {
    /**
     * The name of the deleted at attribute.
     *
     * @type {string}
     *
     * @protected
     */
    protected static readonly deletedAt: string = 'deleted_at';

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
    public getDeletedAtColumn(): string {
        return this.setStringCase(SoftDeletes.deletedAt);
    }

    /**
     * Determine if the model uses soft deletes timestamp.
     *
     * @return {boolean}
     */
    public usesSoftDeletes(): boolean {
        return this.softDeletes;
    }

    /**
     * Delete the model.
     *
     * @param {object=} data
     *
     * @return {Promise<boolean>}
     */
    public async delete(data: Record<string, unknown> = {}): Promise<Model> {
        if (!this.usesSoftDeletes()) {
            return super.delete(data);
        }

        const deletedAt = this.getDeletedAtColumn();

        if (this.getAttribute(deletedAt)) {
            return Promise.resolve(this as unknown as Model);
        }

        // @ts-expect-error
        (this as unknown as Model).throwIfDoesntExists('delete');

        this.setEndpoint(finish(this.getEndpoint(), '/') + String((this as unknown as Model).getKey()));
        return super.delete({
            ...data,
            [deletedAt]: new Date().toISOString()
        }).then(model => {
            return this.setAttribute(deletedAt, model.getAttribute(deletedAt))
                .syncOriginal(deletedAt) as unknown as Model;
        });
    }

    /**
     * Set the deleted at column to null on remote.
     *
     * @return {Promise<this>}
     */
    public async restore(): Promise<this> {
        if (!this.usesSoftDeletes() || !this.getAttribute(this.getDeletedAtColumn())) {
            return Promise.resolve(this);
        }

        if (!(this as unknown as Model).getKey()) {
            throw new LogicException(
                'Attempted to call restore on \'' + (this as unknown as Model).getName()
                + '\' when it doesn\'t have a primary key.'
            );
        }

        return this.setEndpoint(finish(this.getEndpoint(), '/') + String((this as unknown as Model).getKey()))
            .patch({ [this.getDeletedAtColumn()]: null })
            .then(model => {
                const deletedAt = this.getDeletedAtColumn();

                return this.setAttribute(deletedAt, model.getAttribute(deletedAt, null)).syncOriginal(deletedAt);
            });
    }
}
