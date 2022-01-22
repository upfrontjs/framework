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
    public async handle(
        promise: Promise<ApiResponse & { request: { method: 'HEAD' | 'head' } }>
        // omit to discourage accessing such on HEAD responses
    ): Promise<Omit<ApiResponse, 'data' | 'json'> | undefined>;
    public async handle<T>(promise: Promise<ApiResponse<T>>): Promise<T | undefined>;
    public async handle(promise: Promise<ApiResponse>): Promise<unknown> {
        return promise
            .then(async response => this.handleResponse(response))
            .catch(async error => this.handleError(error))
            .finally(() => this.handleFinally());
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
    public async handleResponse(
        response: ApiResponse & { request: { method: 'HEAD' | 'head' } }
    ): Promise<Omit<ApiResponse, 'data' | 'json'> | undefined>;
    public async handleResponse<T>(response: ApiResponse<T>): Promise<T | undefined>;
    public async handleResponse(response: ApiResponse): Promise<unknown | undefined> {
        if (response.status >= 400) {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw response;
        }

        if (response.status < 200 || response.status > 299 || response.status === 204) return;

        if (response.request) {
            if (response.request.method === 'HEAD') {
                // this response was the answer to the `HEAD` request
                // and the user is likely looking for the headers
                // but return the whole response just in case
                return response;
            }
        }

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
