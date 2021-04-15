import User from '../../mock/Models/User';
import { buildResponse, getLastFetchCall, mockUserModelResponse } from '../../test-helpers';
import { advanceTo } from 'jest-date-mock';
import type { Attributes } from '../../../src';
import { finish, snake } from '../../../src';
import fetchMock from 'jest-fetch-mock';
import LogicException from '../../../src/Exceptions/LogicException';

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
        it('should return if the model has already been deleted', async () => {
            softDeletes.setAttribute(softDeletes.getDeletedAtColumn(), new Date().toISOString());
            await softDeletes.delete();

            expect(getLastFetchCall()).toBeUndefined();
        });

        it('should call the parent delete method if not using soft deletes', async () => {
            mockUserModelResponse(softDeletes);

            Object.defineProperty(softDeletes, 'softDeletes', {
                value: false
            });

            await softDeletes.delete();

            expect(getLastFetchCall()?.body).toBeUndefined();
        });

        it('should send a DELETE request', async () => {
            mockUserModelResponse(softDeletes);

            await softDeletes.delete();

            expect(getLastFetchCall()?.method).toBe('delete');
            expect(getLastFetchCall()?.url)
                .toContain(finish(softDeletes.getEndpoint(), '/') + String(softDeletes.getKey()));
        });

        it('should merge in the deleted at column into the optional parameters', async () => {
            mockUserModelResponse(softDeletes);

            const now = new Date();

            advanceTo(now);

            await softDeletes.delete();

            expect(getLastFetchCall()?.body)
                .toStrictEqual({ [snake(softDeletes.getDeletedAtColumn())]: now.toISOString() });
        });

        it('should update the model\'s deleted at column', async () => {
            const now = new Date();

            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse({
                ...softDeletes.getRawOriginal(),
                [softDeletes.getDeletedAtColumn()]: now.toISOString()
            } as Attributes)));

            advanceTo(now);

            await softDeletes.delete();

            expect(softDeletes.getAttribute(softDeletes.getDeletedAtColumn())).toBe(now.toISOString());
        });

        it('should throw an error if the model has not been persisted before calling the method', async () => {
            softDeletes = User.factory().make() as User;

            await expect(softDeletes.delete()).rejects.toThrow(new LogicException(
                'Attempted to call delete on \'' + softDeletes.getName()
                + '\' when it has not been persisted yet or it has been soft deleted.'
            ));
        });
    });

    describe('restore()', () => {
        beforeEach(() => {
            softDeletes.setAttribute(softDeletes.getDeletedAtColumn(), new Date().toISOString()).syncOriginal();
        });

        it('should return itself if it isn\'t using soft deletes', async () => {
            Object.defineProperty(softDeletes, 'softDeletes', {
                value: false
            });

            softDeletes = await softDeletes.restore();

            expect(softDeletes).toStrictEqual(softDeletes);
        });

        it('should return itself if the deleted at column is already undefined', async () => {
            softDeletes.setAttribute(softDeletes.getDeletedAtColumn(), undefined);

            softDeletes = await softDeletes.restore();

            expect(getLastFetchCall()).toBeUndefined();
        });

        it('should set the deleted at column to undefined', async () => {
            // response will not include the deleted at column
            const responseUser = User.factory().create() as User;
            responseUser.deleteAttribute(responseUser.getDeletedAtColumn()).syncOriginal();
            mockUserModelResponse(responseUser);

            softDeletes = await softDeletes.restore()!;

            // but it's still set to null
            expect(softDeletes.getAttribute(softDeletes.getDeletedAtColumn())).toBeNull();
        });

        it('should send a PATCH request with the column set to null', async () => {
            mockUserModelResponse(softDeletes);

            softDeletes = await softDeletes.restore()!;

            expect(getLastFetchCall()?.method).toBe('patch');
            expect(getLastFetchCall()?.body).toStrictEqual({ [snake(softDeletes.getDeletedAtColumn())]: null });
            expect(getLastFetchCall()?.url)
                .toContain(finish(softDeletes.getEndpoint(), '/') + String(softDeletes.getKey()));
        });

        it('should throw an error if the model doesn\'t have a primary key', async () => {
            softDeletes.deleteAttribute(softDeletes.getKeyName());

            await expect(softDeletes.restore()).rejects.toThrow(new LogicException(
                'Attempted to call restore on \'' + softDeletes.getName() + '\' when it doesn\'t have a primary key.'
            ));
        });
    });
});
