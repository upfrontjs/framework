import type { Method } from '../Calliope/Concerns/CallsApi';
import type { ApiResponse } from './HandlesApiResponse';
import type { MaybeArray } from '../Support/type';

/**
 * Interface prescribes what's expected to be implemented
 * by an object that initiates api requests.
 *
 * @link {API.prototype.call}
 * @link {CallsApi.prototype.call}
 */
export default interface ApiCaller {
    /**
     * Optional property containing request configuration object.
     *
     * @type {Partial<RequestInit>?}
     */
    requestOptions?: Partial<RequestInit>;

    /**
     * If defined it should return a request configuration object.
     *
     * @param {string} url - The endpoint the request goes to.
     * @param {Method} method - The method the request uses.
     * @param {object=} data - The optional data to send with the request.
     *
     * @return {Partial<RequestInit>}
     */
    initRequest?: (
        url: string,
        method: Method,
        data?: FormData | Record<string, unknown>,
        queryParameters?: Record<string, any>
    ) => Partial<RequestInit> | Promise<Partial<RequestInit>>;

    /**
     * The expected signature of the call method.
     *
     * @param {string} url - The endpoint the request goes to.
     * @param {Method} method - The method the request uses.
     * @param {object=} data - The optional data to send with the request.
     * @param {object=} customHeaders - Custom headers to merge into the request.
     *
     * @return {Promise<ApiResponse>}
     */
    call: (
        url: string,
        method: Method,
        data?: FormData | Record<string, unknown>,
        customHeaders?: Record<string, MaybeArray<string>>,
        queryParameters?: Record<string, any>
    ) => Promise<ApiResponse>;
}
