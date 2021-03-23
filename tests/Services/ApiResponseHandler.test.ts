import ApiResponseHandler from '../../src/Services/ApiResponseHandler';
import fetchMock from 'jest-fetch-mock';
import { buildResponse } from '../test-helpers';
import User from '../mock/Models/User';

const handler = new ApiResponseHandler();

describe('ApiResponseHandler', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it('should parse the body if data wrapped', async () => {
        fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse({ data: User.factory().raw() })));
        const parsedResponse = await handler.handle(fetch('url'));

        expect(parsedResponse).toStrictEqual(User.factory().raw());
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

    it('should throw an error on error', async () => {
        const error = new Error('Rejected response');
        fetchMock.mockReject(error);

        await expect(handler.handle(fetch('url'))).rejects
            .toStrictEqual(new Error('Request has failed with the following message:\n' + String(error)));
    });
});
