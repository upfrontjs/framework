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
     * @param {'get' | 'post' | 'delete' | 'patch' | 'put'} method - The method the request uses.
     * @param {object=} data - The optional data to send with the request.
     *
     * @return {Partial<RequestInit>}
     */
    initRequest?(
        url: string,
        method: 'get'|'post'|'delete'|'patch'|'put',
        data?: Record<string, unknown>
    ): Partial<RequestInit>;

    /**
     * The expected signature of the call method.
     *
     * @param {string} url - The endpoint the request goes to.
     * @param {'get' | 'post' | 'delete' | 'patch' | 'put'} method - The method the request uses.
     * @param {object=} data - The optional data to send with the request.
     * @param {object=} customHeaders - Custom headers to merge into the request.
     *
     * @return {Promise<Response>}
     */
    call(
        url: string,
        method: 'get'|'post'|'delete'|'patch'|'put',
        data?: Record<string, unknown>,
        customHeaders?: Record<string, string|string[]>
    ): Promise<Response>;
}
