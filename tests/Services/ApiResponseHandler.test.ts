import ApiResponseHandler from '../../src/Services/ApiResponseHandler';
import fetchMock from '../mock/fetch-mock';
import User from '../mock/Models/User';
import type { ApiResponse } from '../../src/Contracts/HandlesApiResponse';
import { API } from '../../src';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

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
            // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
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
            // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
            const resp = await handler.handle<ApiResponse>(fetch('url')).catch(r => r);
            expect(resp.status).toBe(503);
            expect(resp.statusText).toBe('Service Unavailable');
        });

        it('should throw JSON error if returned data cannot be parsed', async () => {
            fetchMock.mockResponseOnce('{"key":"value"');
            let expectedError = '"invalid json response body at  reason: Unexpected end of JSON input"';
            const nodeVersion = parseInt(process.versions.node);

            // eslint-disable-next-line jest/no-conditional-in-test
            if (nodeVersion >= 19) {
                expectedError = '"invalid json response body at  reason: ' +
                    'Expected \',\' or \'}\' after property value in JSON at position 14"';

                // eslint-disable-next-line jest/no-conditional-in-test
                if (nodeVersion >= 21) {
                    expectedError = expectedError.slice(0, -1) + ' (line 1 column 15)"';
                }
            }

            await expect(handler.handle(fetch('url'))).rejects.toThrowErrorMatchingInlineSnapshot(expectedError);
        });
    });

    it.each([
        [204, 'has no content'],
        [101, 'is an informational response'],
        [302, 'as a redirect response']
    ])('should return undefined if the response (%s) %s', async (status) => {
        fetchMock.mockResponseOnce(undefined, { status });

        await expect(handler.handle(fetch('url')).catch((r: unknown) => r)).resolves.toBeUndefined();
    });

    it('should return undefined if it\'s a successful response but has no json parsing available', async () => {
        await expect(handler.handle(
            Promise.resolve({ status: 200, statusText: 'OK', headers: new Headers }))
        ).resolves.toBeUndefined();
    });

    it.each(['HEAD', 'OPTIONS', 'TRACE', 'CONNECT'])(
        'should return the response if it was called with a %s request',
        async (method) => {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            fetchMock.mockResponseOnce(undefined, { headers: { 'Content-Length': '12345' } });

            const apiResponse = (await handler.handle(new API().call(
                'url',
                method as 'CONNECT' | 'HEAD' | 'OPTIONS' | 'TRACE'
            )))!;
            expect(apiResponse).toBeInstanceOf(Response);
            expect(apiResponse.headers.get('Content-Length')).toBe('12345');
        });
});
