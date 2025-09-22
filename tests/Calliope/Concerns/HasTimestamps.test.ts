import User from '../../mock/Models/User';
import fetchMock, { getLastRequest } from '../../mock/fetch-mock';
import InvalidArgumentException from '../../../src/Exceptions/InvalidArgumentException';
import { config, now } from '../../setupTests';
import { start, finish } from '../../../src';
import LogicException from '../../../src/Exceptions/LogicException';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let hasTimestamps: User;

describe('HasTimestamps', () => {
    beforeEach(() => {
        hasTimestamps = User.factory().createOne();
        fetchMock.mockResponseOnce(User.factory().create()
            .only([hasTimestamps.getCreatedAtName(), hasTimestamps.getUpdatedAtName()])
        );
    });

    describe('getCreatedAtName', () => {
        it('should return the createdAt attribute', () => {
            expect(hasTimestamps.getCreatedAtName()).toBe('createdAt');
        });

        it('should return the createdAt attribute correctly if overridden', () => {
            class MyUser extends User {
                protected static override readonly createdAt = 'my_created_at';
            }
            hasTimestamps = new MyUser;

            expect(hasTimestamps.getCreatedAtName()).toBe('myCreatedAt');
        });
    });

    describe('getUpdatedAtName', () => {
        it('should return the updatedAt attribute', () => {
            expect(hasTimestamps.getUpdatedAtName()).toBe('updatedAt');
        });

        it('should return the updatedAt attribute correctly if overridden', () => {
            class MyUser extends User {
                protected static override readonly updatedAt = 'my_updated_at';
            }
            hasTimestamps = new MyUser;

            expect(hasTimestamps.getUpdatedAtName()).toBe('myUpdatedAt');
        });
    });

    describe('usesTimestamps()', () => {
        it('should return whether it uses timestamps or not', () => {
            expect(hasTimestamps.usesTimestamps()).toBe(true);

            Object.defineProperty(hasTimestamps, 'timestamps', {
                value: false
            });

            expect(hasTimestamps.usesTimestamps()).toBe(false);

            Object.defineProperty(hasTimestamps, 'timestamps', {
                value: true
            });
        });
    });

    describe('touch()', () => {
        it('should send a PATCH request', async () => {
            await hasTimestamps.touch();

            expect(getLastRequest()?.method).toBe('PATCH');
            expect(getLastRequest()?.url)
                .toContain(finish(hasTimestamps.getEndpoint(), '/') + String(hasTimestamps.getKey()));
        });

        it('should update the timestamps', async () => {
            const createdAt = hasTimestamps.getAttribute(hasTimestamps.getCreatedAtName());
            const updatedAt = hasTimestamps.getAttribute(hasTimestamps.getUpdatedAtName());

            // eslint-disable-next-line @typescript-eslint/naming-convention
            const newUpdatedAt = { data: {  updated_at: new Date(now.getSeconds() + 1).toISOString() } };
            fetchMock.resetMocks();
            fetchMock.mockResponseOnce(newUpdatedAt);
            await hasTimestamps.touch();

            expect(hasTimestamps.getAttribute(hasTimestamps.getCreatedAtName())).toBe(createdAt);
            expect(hasTimestamps.getAttribute(hasTimestamps.getUpdatedAtName())).not.toBe(updatedAt);
        });

        it('should throw an error if updated at attribute is not in the response',  async () => {
            fetchMock.resetMocks();
            fetchMock.mockResponseOnce({ createdAt: new Date().toISOString() });

            const failingFunc = vi.fn(async () => hasTimestamps.touch());

            await expect(failingFunc).rejects.toThrow(new InvalidArgumentException(
                '\'' + hasTimestamps.getUpdatedAtName() + '\' is not found in the response model.'
            ));
        });

        it('should return itself if timestamps are not used', async () => {
            fetchMock.resetMocks();
            Object.defineProperty(hasTimestamps, 'timestamps', {
                value: false
            });

            await expect(hasTimestamps.touch()).resolves.toStrictEqual(hasTimestamps);
            expect(getLastRequest()).toBeUndefined();

            Object.defineProperty(hasTimestamps, 'timestamps', {
                value: true
            });
        });

        it('should throw an error if the model has not been persisted before calling the method', async () => {
            hasTimestamps = User.factory().makeOne();

            await expect(hasTimestamps.touch()).rejects.toThrow(new LogicException(
                'Attempted to call touch on \'' + hasTimestamps.getName()
                + '\' when it has not been persisted yet or it has been soft deleted.'
            ));
        });
    });

    describe('freshTimestamps()', () => {
        it('should send a GET request with the selected columns', async () => {
            await hasTimestamps.freshTimestamps();

            expect(getLastRequest()?.method).toBe('GET');
            expect(getLastRequest()?.url).toBe(
                String(config.get('baseEndPoint'))
                + finish(start(hasTimestamps.getEndpoint(), '/'), '/' + String(hasTimestamps.getKey()))
                + '?wheres[0][column]=id&wheres[0][operator]=%3D&wheres[0][value]=1&wheres[0][boolean]=and'
                + '&columns[0]=createdAt&columns[1]=updatedAt'
            );
        });

        it('should update the timestamps', async () => {
            fetchMock.resetMocks();

            const createdAt = hasTimestamps.getAttribute(hasTimestamps.getCreatedAtName());
            const updatedAt = hasTimestamps.getAttribute(hasTimestamps.getUpdatedAtName());

            fetchMock.mockResponseOnce({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                updated_at: new Date(now.getSeconds() + 1).toISOString(),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                created_at: new Date(now.getSeconds() + 1).toISOString()
            });
            await hasTimestamps.freshTimestamps();

            expect(hasTimestamps.getAttribute(hasTimestamps.getCreatedAtName())).not.toBe(createdAt);
            expect(hasTimestamps.getAttribute(hasTimestamps.getUpdatedAtName())).not.toBe(updatedAt);
        });

        it('should return itself instead of new instance', async () => {
            const timestamped = await hasTimestamps.freshTimestamps();

            hasTimestamps.name = 'new name';
            expect(timestamped.name).toBe('new name');
        });

        it('should throw an error if created at column is not in the response',  async () => {
            fetchMock.resetMocks();
            fetchMock.mockResponseOnce({ updatedAt: new Date().toISOString() });

            const failingFunc = vi.fn(async () => hasTimestamps.freshTimestamps());

            await expect(failingFunc).rejects.toThrow(new InvalidArgumentException(
                '\'' + hasTimestamps.getCreatedAtName() + '\' is not found in the response model.'
            ));
        });

        it('should throw an error if updated at column is not in the response',  async () => {
            fetchMock.resetMocks();
            fetchMock.mockResponseOnce({ createdAt: new Date().toISOString() });

            const failingFunc = vi.fn(async () => hasTimestamps.freshTimestamps());

            await expect(failingFunc).rejects.toThrow(new InvalidArgumentException(
                '\'' + hasTimestamps.getUpdatedAtName() + '\' is not found in the response model.'
            ));
        });

        it('should return itself if timestamps are not used', async () => {
            fetchMock.resetMocks();
            Object.defineProperty(hasTimestamps, 'timestamps', {
                value: false
            });

            await expect(hasTimestamps.freshTimestamps()).resolves.toStrictEqual(hasTimestamps);
            expect(getLastRequest()).toBeUndefined();

            Object.defineProperty(hasTimestamps, 'timestamps', {
                value: true
            });
        });

        it('should throw an error if the model has not been persisted before calling the method', async () => {
            hasTimestamps = User.factory().makeOne();

            await expect(hasTimestamps.freshTimestamps()).rejects.toThrow(new LogicException(
                'Attempted to call freshTimestamps on \''
                + hasTimestamps.getName() + '\' when it has not been persisted yet or it has been soft deleted.'
            ));
        });
    });
});
