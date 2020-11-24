import ApiResponseHandler from '../../src/Services/ApiResponseHandler';
import data from '../mock/Models/data';
import fetchMock from 'jest-fetch-mock';
import { buildResponse } from '../test-helpers';

const handler = new ApiResponseHandler();

describe('apiResponseHandler', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it('can parse the body if data wrapped', async () => {
        fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse({ data: data.UserOne })));
        const parsedResponse = await handler.handle(fetch('url'));

        expect(parsedResponse).toStrictEqual(data.UserOne);
    });

    it('casts to boolean if only string boolean returned', async () => {
        fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse('true')));

        const parsedResponse = await handler.handle(fetch('url'));

        expect(parsedResponse).toBe(true);
    });

    it('calls the handleFinally method', async () => {
        const mockFn = jest.fn();
        handler.handleFinally = () => mockFn();
        fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse(data.UserOne)));
        await handler.handle(fetch('url'));

        expect(mockFn).toHaveBeenCalled();
    });

    it('throws error on error', async () => {
        const error = new Error('Rejected response');
        fetchMock.mockReject(error);

        await expect(handler.handle(fetch('url'))).rejects
            .toStrictEqual(new Error('Request has failed with the following message:\n' + String(error)));
    });
});
