type TransformedResponse = Partial<Response> & Pick<Response, 'headers' | 'status' | 'statusText'>;

export interface ApiResponse extends TransformedResponse {
    /**
     * The parsed response content.
     * (in case of libraries like axios)
     */
    data?: Record<string, any> | string | null;

    /**
     * The request that got this response.
     */
    request?: RequestInit;

    /**
     * The url the request was sent to.
     */
    url?: string;

    /**
     * Additional information.
     */
    [key: string]: any;
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
