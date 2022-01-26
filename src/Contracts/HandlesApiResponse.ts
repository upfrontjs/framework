/**
 * The http library agnostic response.
 */
export interface ApiResponse<
    T = any[] | Record<string, any> | string | null
> extends Pick<Response, 'headers' | 'status' | 'statusText'> {
    /**
     * The parsed response content.
     * (in case of libraries like axios)
     */
    data?: T;

    /**
     * The request that got this response.
     */
    request?: Record<string, any> & (RequestInit | XMLHttpRequest);

    /**
     * The url the request was sent to.
     */
    url?: string;

    /**
     * Additional information.
     */
    [key: string]: any;

    /**
     * The fetch json method resolving to the given type.
     */
    json?: () => Promise<Exclude<T, string | null>>;
}

/**
 * Interface prescribes what's expected to be implemented
 * by an object that is used for handling the requests.
 */
export default interface HandlesApiResponse {
    /**
     * Handle the promised response.
     *
     * @param promise
     *
     * @return {Promise<any>}
     */
    handle: <T = unknown>(promise: Promise<ApiResponse>) => Promise<T>;
}
