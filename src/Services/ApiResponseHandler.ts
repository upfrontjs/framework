import type HandlesApiResponse from '../Contracts/HandlesApiResponse';
import type { ApiResponse } from '../Contracts/HandlesApiResponse';
import { isObjectLiteral } from '../Support/function';

/**
 * The default HandlesApiResponse class used by the package.
 *
 * @link {HandlesApiResponse}
 */
export default class ApiResponseHandler implements HandlesApiResponse {
    /**
     * @inheritDoc
     */
    public async handle(promise: Promise<ApiResponse>): Promise<any> {
        return promise
            .then(async (response: ApiResponse) => this.handleResponse(response))
            .catch(error => this.handleError(error))
            .finally(() => this.handleFinally());
    }

    /**
     * Handle successful request.
     *
     * @param {ApiResponse} response
     *
     * @return {Promise<any>}
     */
    public async handleResponse(response: ApiResponse): Promise<any> {
        if (!response.json) return;

        let responseData = await response.json();

        if (isObjectLiteral(responseData) && 'data' in responseData) {
            responseData = responseData.data;
        }

        return responseData;
    }

    /**
     * Handle errors that occurred during the promise execution.
     *
     * @param {any} rejectReason
     *
     * @return {void}
     */
    public handleError(rejectReason: unknown): never {
        throw new Error('Request has failed with the following message:\n' + String(rejectReason));
    }

    /**
     * If extending, you may do any final operations after the request.
     *
     * @return {void}
     */
    public handleFinally(): void {
        //
    }
}
