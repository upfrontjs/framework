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
            .catch(async error => this.handleError(error))
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
        if (response.status >= 400) {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw response;
        }

        if (response.status < 200 || response.status > 299 || response.status === 204) return;

        if (response.request) {
            if ('method' in response.request && response.request.method && response.request.method === 'HEAD') {
                // this response was the answer to the `HEAD` request
                // and the user is likely looking for the headers
                // but return the whole response just in case
                return response;
            }
        }

        if (typeof response.json === 'function') {
            return (response as Response).json();
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
    public async handleError(rejectReason: unknown): Promise<never> {
        return Promise.reject(rejectReason);
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
