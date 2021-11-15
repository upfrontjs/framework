import type HandlesApiResponse from '../Contracts/HandlesApiResponse';
import type { ApiResponse } from '../Contracts/HandlesApiResponse';

/**
 * The default HandlesApiResponse implementation used by upfrontjs.
 *
 * @link {HandlesApiResponse}
 */
export default class ApiResponseHandler implements HandlesApiResponse {
    /**
     * @inheritDoc
     */
    public async handle<T = unknown | undefined>(promise: Promise<ApiResponse>): Promise<T> {
        return promise
            .then(async (response: ApiResponse) => this.handleResponse(response))
            .catch(error => this.handleError(error))
            .finally(() => this.handleFinally()) as Promise<T>;
    }

    /**
     * Handle successful request.
     *
     * @param {ApiResponse} response
     *
     * @return {Promise<any>}
     *
     * @throws {ApiResponse}
     */
    public async handleResponse(response: ApiResponse): Promise<unknown | undefined> {
        if (typeof response.json === 'function') {
            return response.json();
        }

        return;
    }

    /**
     * Handle errors that occurred during the promise execution.
     *
     * @param {any} rejectReason
     *
     * @return {void}
     */
    public handleError(rejectReason: unknown): never {
        throw rejectReason;
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
