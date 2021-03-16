import User from '../../mock/Models/User';
import { getLastFetchCall, mockUserModelResponse } from '../../test-helpers';
import { advanceTo } from 'jest-date-mock';
import { snake } from '../../../src';

let softDeletes: User;

describe('SoftDeletes', () => {
    beforeEach(() => {
        softDeletes = User.factory().create() as User;
        fetchMock.resetMocks();
    });

    describe('trashed()', () => {
        it('should correctly determine if it is soft deleted', () => {
            expect(softDeletes.trashed()).toBe(false);

            softDeletes.setAttribute(softDeletes.getDeletedAtColumn(), new Date().toISOString());

            expect(softDeletes.trashed()).toBe(true);
        });
    });

    describe('getDeletedAtColumn()', () => {
        it('should return the deletedAt column', () => {
            expect(softDeletes.getDeletedAtColumn()).toBe('deletedAt');
        });
    });

    describe('usesSoftDeletes', () => {
        it('should be able to determine whether it uses soft deletes or not', () => {
            expect(softDeletes.usesSoftDeletes()).toBe(true);

            Object.defineProperty(softDeletes, 'softDeletes', {
                value: false
            });

            expect(softDeletes.usesSoftDeletes()).toBe(false);

            Object.defineProperty(softDeletes, 'softDeletes', {
                value: true
            });
        });
    });

    describe('delete()', () => {
        it('should call the parent delete method if not using soft deletes', async () => {
            mockUserModelResponse(softDeletes);

            Object.defineProperty(softDeletes, 'softDeletes', {
                value: false
            });

            await softDeletes.delete();

            expect(getLastFetchCall()?.body).toBeUndefined();
        });

        it('should merge in the deleted at column into the optional parameters', async () => {
            mockUserModelResponse(softDeletes);

            const now = new Date();

            advanceTo(now);

            await softDeletes.delete();

            expect(getLastFetchCall()?.body)
                .toStrictEqual({ [snake(softDeletes.getDeletedAtColumn())]: now.toISOString() });
        });

        it('should return the model with the updated deleted at column', async () => {
            mockUserModelResponse(softDeletes);
            const now = new Date();

            advanceTo(now);

            softDeletes = await softDeletes.delete() as User;

            expect(softDeletes.getAttribute(softDeletes.getDeletedAtColumn())).toBe(now.toISOString());
        });
    });

    describe('restore()', () => {
        beforeEach(() => {
            softDeletes.setAttribute(softDeletes.getDeletedAtColumn(), new Date().toISOString());
        });

        it('should return itself if it isn\'t using soft deletes', async () => {
            Object.defineProperty(softDeletes, 'softDeletes', {
                value: false
            });

            softDeletes = await softDeletes.restore() as User;

            expect(softDeletes).toStrictEqual(softDeletes);
        });

        it('should return itself if the deleted at column is already undefined', async () => {
            softDeletes.setAttribute(softDeletes.getDeletedAtColumn(), undefined);

            softDeletes = await softDeletes.restore() as User;

            expect(getLastFetchCall()).toBeUndefined();
        });

        it('should set the deleted at column to undefined', async () => {
            // response will not include the deleted at column
            mockUserModelResponse(softDeletes);

            softDeletes = await softDeletes.restore() as User;

            // but it's still set to undefined
            expect(softDeletes.getAttribute(softDeletes.getDeletedAtColumn())).toBeUndefined();
        });

        it('should send a patch request with the column set to null', async () => {
            mockUserModelResponse(softDeletes);

            softDeletes = await softDeletes.restore() as User;

            expect(getLastFetchCall()?.method).toBe('patch');
            expect(getLastFetchCall()?.body).toStrictEqual({ [snake(softDeletes.getDeletedAtColumn())]: null });
        });
    });
});
