import ApiResponseHandler from '../../src/Services/ApiResponseHandler';
import fetchMock from '../mock/fetch-mock';
import User from '../mock/Models/User';
import type { ApiResponse } from '../../src/Contracts/HandlesApiResponse';
import { API } from '../../src';

const handler = new ApiResponseHandler();

describe('ApiResponseHandler', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it('should cast to boolean if only string boolean returned', async () => {
        fetchMock.mockResponseOnce('true');

        const parsedResponse = await handler.handle(fetch('url'));

        expect(parsedResponse).toBe(true);
    });

    it('should call the handleFinally method', async () => {
        const mockFn = jest.fn();
        handler.handleFinally = () => mockFn();
        fetchMock.mockResponseOnce(User.factory().raw());
        await handler.handle(fetch('url'));

        expect(mockFn).toHaveBeenCalled();
    });

    describe('errors', () => {
        it('should throw an error on error', async () => {
            const error = new Error('Rejected response');
            fetchMock.mockRejectOnce(error);

            await expect(handler.handle(fetch('url'))).rejects.toStrictEqual(error);
        });

        it('should throw the response if the response is a client error', async () => {
            fetchMock.mockResponseOnce(undefined, {
                status: 404,
                statusText: 'Not Found'
            });

            await expect(handler.handle(fetch('url'))).rejects.toBeInstanceOf(Response);
            fetchMock.mockResponseOnce(undefined, {
                status: 404,
                statusText: 'Not Found'
            });
            const resp = await handler.handle<ApiResponse>(fetch('url')).catch(r => r);
            expect(resp.status).toBe(404);
            expect(resp.statusText).toBe('Not Found');
        });

        it('should throw the response if the response is a server error', async () => {
            fetchMock.mockResponseOnce(undefined, {
                status: 503,
                statusText: 'Service Unavailable'
            });

            await expect(handler.handle(fetch('url'))).rejects.toBeInstanceOf(Response);
            fetchMock.mockResponseOnce(undefined, {
                status: 503,
                statusText: 'Service Unavailable'
            });
            const resp = await handler.handle<ApiResponse>(fetch('url')).catch(r => r);
            expect(resp.status).toBe(503);
            expect(resp.statusText).toBe('Service Unavailable');
        });

        it('should throw JSON error if returned data cannot be parsed', async () => {
            fetchMock.mockResponseOnce('{"key":"value"');
            await expect(handler.handle(fetch('url')))
                .rejects
                .toThrowErrorMatchingInlineSnapshot(
                    '"invalid json response body at  reason: Unexpected end of JSON input"'
                );
        });
    });

    it.each([
        [204, 'has no content'],
        [101, 'is an informational response'],
        [302, 'as a redirect response']
    ])('should return undefined if the response (%s) %s', async (status) => {
        fetchMock.mockResponseOnce(undefined, { status });

        await expect(handler.handle(fetch('url')).catch(r => r)).resolves.toBeUndefined();
    });

    it('should return undefined if it\'s a successful response but has no json parsing available', async () => {
        await expect(handler.handle(
            Promise.resolve({ status: 200, statusText: 'OK', headers: new Headers }))
        ).resolves.toBeUndefined();
    });

    it('should return the response if it was called with a head request', async () => {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        fetchMock.mockResponseOnce(undefined, { headers: { 'Content-Length': '12345' } });

        const apiResponse = (await handler.handle(new API().call('url', 'HEAD')))!;
        expect(apiResponse).toBeInstanceOf(Response);
        expect(apiResponse.headers.get('Content-Length')).toBe('12345');
    });
});
