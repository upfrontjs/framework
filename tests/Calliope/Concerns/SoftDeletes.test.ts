import User from '../../mock/Models/User';
import { buildResponse, getLastRequest, mockUserModelResponse } from '../../test-helpers';
import { finish, snake } from '../../../src';
import fetchMock from 'jest-fetch-mock';
import LogicException from '../../../src/Exceptions/LogicException';
import { now } from '../../setupTests';

let softDeletes: User;

describe('SoftDeletes', () => {
    beforeEach(() => {
        softDeletes = User.factory().create() as User;
        fetchMock.resetMocks();
    });

    describe('trashed()', () => {
        it('should correctly determine if it is soft deleted', () => {
            expect(softDeletes.trashed()).toBe(false);

            softDeletes.setAttribute(softDeletes.getDeletedAtName(), new Date().toISOString());

            expect(softDeletes.trashed()).toBe(true);
        });
    });

    describe('getDeletedAtName()', () => {
        it('should return the deletedAt attribute', () => {
            expect(softDeletes.getDeletedAtName()).toBe('deletedAt');
        });

        it('should return the deletedAt name correctly if overridden', () => {
            class MyUser extends User {
                protected static readonly deletedAt = 'my_deleted_at';
            }
            softDeletes = new MyUser;

            expect(softDeletes.getDeletedAtName()).toBe('myDeletedAt');
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
            softDeletes.setAttribute(softDeletes.getDeletedAtName(), new Date().toISOString());
            await softDeletes.delete();

            expect(getLastRequest()).toBeUndefined();
        });

        it('should call the parent delete method if not using soft deletes', async () => {
            mockUserModelResponse(softDeletes);

            Object.defineProperty(softDeletes, 'softDeletes', {
                value: false
            });

            await softDeletes.delete();

            expect(getLastRequest()?.body).toBeUndefined();
        });

        it('should send a DELETE request', async () => {
            mockUserModelResponse(softDeletes);

            await softDeletes.delete();

            expect(getLastRequest()?.method).toBe('DELETE');
            expect(getLastRequest()?.url)
                .toContain(finish(softDeletes.getEndpoint(), '/') + String(softDeletes.getKey()));
        });

        it('should merge in the deleted at attribute into the optional parameters', async () => {
            mockUserModelResponse(softDeletes);

            await softDeletes.delete();

            expect(getLastRequest()?.body)
                .toStrictEqual({ [snake(softDeletes.getDeletedAtName())]: now.toISOString() });
        });

        it('should set the deleted at on the given form if not already set', async () => {
            mockUserModelResponse(softDeletes);

            const form = new FormData();
            form.append('my_key', 'my_value');

            await softDeletes.delete(form);

            const body = getLastRequest()!.body as FormData;
            expect(body.get('my_key')).toBe('my_value');
            expect(body.get(snake(softDeletes.getDeletedAtName()))).toBe(now.toISOString());
        });

        it('should merge in the optional argument into the request', async () => {
            mockUserModelResponse(softDeletes);

            await softDeletes.delete({
                [softDeletes.getDeletedAtName()]: new Date(now.getTime() + 10).toISOString(),
                key: 'value'
            });

            expect(getLastRequest()?.body)
                .toStrictEqual({
                    [snake(softDeletes.getDeletedAtName())]: new Date(now.getTime() + 10).toISOString(),
                    key: 'value'
                });
        });

        it('should update the model\'s deleted at attribute', async () => {
            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse({
                ...softDeletes.getRawOriginal(),
                [softDeletes.getDeletedAtName()]: now.toISOString()
            })));

            await softDeletes.delete();

            expect(softDeletes.getAttribute(softDeletes.getDeletedAtName())).toBe(now.toISOString());
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
            softDeletes.setAttribute(softDeletes.getDeletedAtName(), new Date().toISOString()).syncOriginal();
        });

        it('should return itself if it isn\'t using soft deletes', async () => {
            Object.defineProperty(softDeletes, 'softDeletes', {
                value: false
            });

            softDeletes = await softDeletes.restore();

            expect(softDeletes).toStrictEqual(softDeletes);
        });

        it('should return itself if the deleted at attribute is already undefined', async () => {
            softDeletes.setAttribute(softDeletes.getDeletedAtName(), undefined);

            softDeletes = await softDeletes.restore();

            expect(getLastRequest()).toBeUndefined();
        });

        it('should set the deleted at attribute to null', async () => {
            // response will not include the deleted at column
            const responseUser = User.factory().create() as User;
            responseUser.deleteAttribute(responseUser.getDeletedAtName()).syncOriginal();
            mockUserModelResponse(responseUser);

            softDeletes = await softDeletes.restore();

            // but it's still set to null
            expect(softDeletes.getAttribute(softDeletes.getDeletedAtName())).toBeNull();
        });

        it('should set the deleted at attribute to whatever the server sends', async () => {
            const responseUser = User
                .factory()
                .createOne({ [softDeletes.getDeletedAtName()]: 'deleted' });
            mockUserModelResponse(responseUser);

            softDeletes = await softDeletes.restore();

            expect(softDeletes.getAttribute(softDeletes.getDeletedAtName())).toBe('deleted');
        });

        it('should send a PATCH request with the attribute set to null', async () => {
            mockUserModelResponse(softDeletes);

            softDeletes = await softDeletes.restore();

            expect(getLastRequest()?.method).toBe('PATCH');
            expect(getLastRequest()?.body).toStrictEqual({ [snake(softDeletes.getDeletedAtName())]: null });
            expect(getLastRequest()?.url)
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
