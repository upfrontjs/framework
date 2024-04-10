import type HandlesApiResponse from '../Contracts/HandlesApiResponse';
import type { ApiResponse } from '../Contracts/HandlesApiResponse';
import type { Method } from '../Calliope/Concerns/CallsApi';

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
        promise: Promise<
        ApiResponse &
        { request: { method: 'CONNECT' | 'connect' | 'HEAD' | 'head' | 'OPTIONS' | 'options' | 'TRACE' | 'trace' } }
        >
        // omit to discourage accessing such on response where it's not available
    ): Promise<Omit<ApiResponse, 'data' | 'json'> | undefined>;
    public async handle<T>(promise: Promise<ApiResponse<T>>): Promise<T | undefined>;
    public async handle(promise: Promise<ApiResponse>): Promise<unknown> {
        return promise
            .then(async response => this.handleResponse(response))
            .catch(async (error: unknown) => this.handleError(error))
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
        response: ApiResponse &
        { request: { method: 'CONNECT' | 'connect' | 'HEAD' | 'head' | 'OPTIONS' | 'options' | 'TRACE' | 'trace' } }
    ): Promise<Omit<ApiResponse, 'data' | 'json'> | undefined>;
    public async handleResponse<T>(response: ApiResponse<T>): Promise<T | undefined>;
    public async handleResponse(response: ApiResponse): Promise<unknown> {
        if (response.status >= 400) {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw response;
        }

        if (response.status < 200 || response.status > 299 || response.status === 204) {
            return undefined;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        const method = response.request?.method?.toUpperCase() as Uppercase<Method> | undefined;

        if (method && ['OPTIONS', 'HEAD', 'TRACE', 'CONNECT'].includes(method)) {
            // the user might just want the headers or debug info
            // so just return the whole response
            return response;
        }

        if (typeof response.json === 'function') {
            return response.json();
        }

        return undefined;
    }

    /**
     * Handle errors that occurred during the promise execution.
     *
     * @param {any} rejectReason
     *
     * @return {void}
     */
    public async handleError(rejectReason: unknown): Promise<unknown> {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
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
