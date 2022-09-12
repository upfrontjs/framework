import HasTimestamps from './HasTimestamps';
import type Model from '../Model';
import LogicException from '../../Exceptions/LogicException';
import { finish } from '../../Support/string';
import type { SimpleAttributes } from './HasAttributes';

export default class SoftDeletes extends HasTimestamps {
    /**
     * The name of the deleted at attribute on the server side.
     *
     * @type {string}
     *
     * @protected
     */
    protected static readonly deletedAt: string = 'deleted_at';

    /**
     * Indicates if the model should expect a timestamp for soft-deletion.
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
        return !!this.getAttribute(this.getDeletedAtName());
    }

    /**
     * Get the name of the deleted at attribute.
     *
     * @return {string}
     */
    public getDeletedAtName(): string {
        return this.setStringCase((this.constructor as unknown as SoftDeletes).deletedAt as string);
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
    public override async delete<T extends Model>(
        data?: FormData | SimpleAttributes | SimpleAttributes<this>
    ): Promise<T> {
        if (!this.usesSoftDeletes()) {
            return super.delete(data);
        }

        const deletedAt = this.getDeletedAtName();

        if (this.getAttribute(deletedAt)) {
            return this as unknown as T;
        }

        this.throwIfModelDoesntExistsWhenCalling('delete');

        this.setEndpoint(finish(this.getEndpoint(), '/') + String((this as unknown as Model).getKey()));

        if (!data) {
            data = { [deletedAt]: new Date().toISOString() };
        } else if (data instanceof FormData) {
            const serverCasedDeletedAt = this.setServerStringCase(deletedAt);
            if (!data.has(serverCasedDeletedAt)) {
                data.append(serverCasedDeletedAt, new Date().toISOString());
            }
        } else if (!(deletedAt in data)) {
            // @ts-expect-error - string is in fact can be used to index here
            data[deletedAt] = new Date().toISOString();
        }

        return super.delete(data).then(model => {
            return this.setAttribute(deletedAt, model.getAttribute(deletedAt))
                .syncOriginal(deletedAt) as unknown as T;
        });
    }

    /**
     * Set the deleted at attribute to null on remote.
     *
     * @return {Promise<this>}
     */
    public async restore(): Promise<this> {
        if (!this.usesSoftDeletes() || !this.getAttribute(this.getDeletedAtName())) {
            return this;
        }

        if (!(this as unknown as Model).getKey()) {
            throw new LogicException(
                'Attempted to call restore on \'' + (this as unknown as Model).getName()
                + '\' when it doesn\'t have a primary key.'
            );
        }

        return this.setEndpoint(finish(this.getEndpoint(), '/') + String((this as unknown as Model).getKey()))
            .patch({ [this.getDeletedAtName()]: null })
            .then(model => {
                const deletedAt = this.getDeletedAtName();

                return this.setAttribute(deletedAt, model.getAttribute(deletedAt, null)).syncOriginal(deletedAt);
            });
    }
}
