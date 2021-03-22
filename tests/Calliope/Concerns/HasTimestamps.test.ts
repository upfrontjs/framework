import User from '../../mock/Models/User';
import fetchMock from 'jest-fetch-mock';
import { buildResponse, getLastFetchCall } from '../../test-helpers';
import { advanceBy } from 'jest-date-mock';
import InvalidArgumentException from '../../../src/Exceptions/InvalidArgumentException';
import { config } from '../../setupTests';
import { start, finish } from '../../../src';
import LogicException from '../../../src/Exceptions/LogicException';

let hasTimestamps: User;

describe('HasTimestamps', () => {
    beforeEach(() => {
        hasTimestamps = User.factory().create() as User;
        fetchMock.mockResponseOnce(async () => Promise.resolve(
            buildResponse(User.factory()
                .create()
                .only([hasTimestamps.getCreatedAtColumn(), hasTimestamps.getUpdatedAtColumn()])
            )
        ));
    });

    describe('getCreatedAtColumn', () => {
        it('should return the createdAt column', () => {
            expect(hasTimestamps.getCreatedAtColumn()).toBe('createdAt');
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

            expect(getLastFetchCall()?.method).toBe('patch');
            expect(getLastFetchCall()?.url)
                .toContain(finish(hasTimestamps.getEndpoint(), '/') + String(hasTimestamps.getKey()));
        });

        it('should update the timestamps', async () => {
            const createdAt = hasTimestamps.getAttribute(hasTimestamps.getCreatedAtColumn());
            const updatedAt = hasTimestamps.getAttribute(hasTimestamps.getUpdatedAtColumn());

            advanceBy(1000);
            await hasTimestamps.touch();

            expect(hasTimestamps.getAttribute(hasTimestamps.getCreatedAtColumn())).toBe(createdAt);
            expect(hasTimestamps.getAttribute(hasTimestamps.getUpdatedAtColumn())).not.toBe(updatedAt);
        });

        it('should throw an error if updated at column is not in the response',  async () => {
            fetchMock.resetMocks();
            fetchMock.mockResponseOnce(async () =>
                Promise.resolve(buildResponse({ createdAt: new Date().toISOString() })));

            const failingFunc = jest.fn(async () => hasTimestamps.touch());

            await expect(failingFunc).rejects.toThrow(new InvalidArgumentException(
                '\'' + hasTimestamps.getUpdatedAtColumn() + '\' is not found in the response model.'
            ));
        });

        it('should return itself if timestamps are not used', async () => {
            fetchMock.resetMocks();
            Object.defineProperty(hasTimestamps, 'timestamps', {
                value: false
            });

            await expect(hasTimestamps.touch()).resolves.toStrictEqual(hasTimestamps);
            expect(getLastFetchCall()).toBeUndefined();

            Object.defineProperty(hasTimestamps, 'timestamps', {
                value: true
            });
        });

        it('should throw an error if the model has not been persisted before calling the method', async () => {
            hasTimestamps = User.factory().make() as User;

            await expect(hasTimestamps.touch()).rejects.toThrow(new LogicException(
                'Attempted to call touch on \'' + hasTimestamps.getName()
                + '\' when it has not been persisted yet or it has been soft deleted.'
            ));
        });
    });

    describe('freshTimestamps()', () => {
        it('should send a GET request with the selected columns', async () => {
            await hasTimestamps.freshTimestamps();

            expect(getLastFetchCall()?.method).toBe('get');
            expect(getLastFetchCall()?.url).toBe(
                String(config.get('baseEndPoint'))
                + finish(start(hasTimestamps.getEndpoint(), '/'), '/' + String(hasTimestamps.getKey()))
                + '?wheres[][column]=id&wheres[][operator]=%3D&wheres[][value]=1&wheres[][boolean]=and'
                + '&columns[]=createdAt&columns[]=updatedAt'
            );
        });

        it('should update the timestamps', async () => {
            fetchMock.resetMocks();
            fetchMock.mockResponseOnce(async () => Promise.resolve(
                // eslint-disable-next-line @typescript-eslint/naming-convention
                buildResponse({ updated_at: new Date().toISOString(), created_at: new Date().toISOString() })
            ));

            const createdAt = hasTimestamps.getAttribute(hasTimestamps.getCreatedAtColumn());
            const updatedAt = hasTimestamps.getAttribute(hasTimestamps.getUpdatedAtColumn());

            advanceBy(1000);
            await hasTimestamps.freshTimestamps();

            expect(hasTimestamps.getAttribute(hasTimestamps.getCreatedAtColumn())).not.toBe(createdAt);
            expect(hasTimestamps.getAttribute(hasTimestamps.getUpdatedAtColumn())).not.toBe(updatedAt);
        });

        it('should return itself instead of new instance', async () => {
            const timestamped = await hasTimestamps.freshTimestamps();

            hasTimestamps.name = 'new name';
            expect(timestamped.name).toBe('new name');
        });

        it('should throw an error if created at column is not in the response',  async () => {
            fetchMock.resetMocks();
            fetchMock.mockResponseOnce(async () =>
                Promise.resolve(buildResponse({ updatedAt: new Date().toISOString() })));

            const failingFunc = jest.fn(async () => hasTimestamps.freshTimestamps());

            await expect(failingFunc).rejects.toThrow(new InvalidArgumentException(
                '\'' + hasTimestamps.getCreatedAtColumn() + '\' is not found in the response model.'
            ));
        });

        it('should throw an error if updated at column is not in the response',  async () => {
            fetchMock.resetMocks();
            fetchMock.mockResponseOnce(async () =>
                Promise.resolve(buildResponse({ createdAt: new Date().toISOString() })));

            const failingFunc = jest.fn(async () => hasTimestamps.freshTimestamps());

            await expect(failingFunc).rejects.toThrow(new InvalidArgumentException(
                '\'' + hasTimestamps.getUpdatedAtColumn() + '\' is not found in the response model.'
            ));
        });

        it('should return itself if timestamps are not used', async () => {
            fetchMock.resetMocks();
            Object.defineProperty(hasTimestamps, 'timestamps', {
                value: false
            });

            await expect(hasTimestamps.freshTimestamps()).resolves.toStrictEqual(hasTimestamps);
            expect(getLastFetchCall()).toBeUndefined();

            Object.defineProperty(hasTimestamps, 'timestamps', {
                value: true
            });
        });

        it('should throw an error if the model has not been persisted before calling the method', async () => {
            hasTimestamps = User.factory().make() as User;

            await expect(hasTimestamps.freshTimestamps()).rejects.toThrow(new LogicException(
                'Attempted to call freshTimestamps on \''
                + hasTimestamps.getName() + '\' when it has not been persisted yet or it has been soft deleted.'
            ));
        });
    });
});
