type TransformedResponse = Partial<Response> & Pick<Response, 'headers' | 'status' | 'statusText'>;

export interface ApiResponse extends TransformedResponse {
    /**
     * The parsed response content.
     * (in case the of libraries like axios)
     */
    data?: Record<string, any> | string | null;
    /**
     * The request that got this response.
     */
    request?: RequestInit;
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
    handle: (promise: Promise<ApiResponse>) => Promise<any>;
}
