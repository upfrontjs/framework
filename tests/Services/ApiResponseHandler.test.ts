import ApiResponseHandler from '../../src/Services/ApiResponseHandler';
import type { MockResponseInit } from 'jest-fetch-mock';
import fetchMock from 'jest-fetch-mock';
import { buildResponse } from '../test-helpers';
import User from '../mock/Models/User';
import type { ApiResponse } from '../../src/Contracts/HandlesApiResponse';

const handler = new ApiResponseHandler();

describe('ApiResponseHandler', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it('should cast to boolean if only string boolean returned', async () => {
        fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse('true')));

        const parsedResponse = await handler.handle(fetch('url'));

        expect(parsedResponse).toBe(true);
    });

    it('should call the handleFinally method', async () => {
        const mockFn = jest.fn();
        handler.handleFinally = () => mockFn();
        fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse(User.factory().raw())));
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
            const response: MockResponseInit = {
                status: 404,
                statusText: 'Not Found',
                body: undefined
            };
            fetchMock.mockResponse(async () => Promise.resolve(buildResponse(undefined, response)));

            await expect(handler.handle(fetch('url'))).rejects.toBeInstanceOf(Response);
            const resp = await handler.handle<ApiResponse>(fetch('url')).catch(r => r);
            expect(resp.status).toBe(404);
            expect(resp.statusText).toBe('Not Found');
        });

        it('should throw the response if the response is a server error', async () => {
            const response: MockResponseInit = {
                status: 503,
                statusText: 'Service Unavailable',
                body: undefined
            };
            fetchMock.mockResponse(async () => Promise.resolve(buildResponse(undefined, response)));

            await expect(handler.handle(fetch('url'))).rejects.toBeInstanceOf(Response);
            const resp = await handler.handle<ApiResponse>(fetch('url')).catch(r => r);
            expect(resp.status).toBe(503);
            expect(resp.statusText).toBe('Service Unavailable');
        });
    });

    it.each([
        [204, 'has no content'],
        [101, 'is an informational response'],
        [302, 'as a redirect response']
    ])('should return undefined if the response (%s) %s', async (status) => {
        const response: MockResponseInit = { status, body: undefined };

        fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse(undefined, response)));

        await expect(handler.handle(fetch('url')).catch(r => r)).resolves.toBeUndefined();
    });

    it('should return undefined if returned data cannot be parsed', async () => {
        fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse('{"key":"value"')));
        await expect(handler.handle(fetch('url')))
            .rejects
            .toThrowErrorMatchingInlineSnapshot(
                '"invalid json response body at  reason: Unexpected end of JSON input"'
            );
    });
});
