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
     * @return {Partial<RequestInit>}
     */
    initRequest?(): Partial<RequestInit>;

    /**
     * The implementation of the call method.
     *
     * @param {string} url
     * @param {'get' | 'post' | 'delete' | 'patch' | 'put'} method
     * @param {object} data
     */
    call(url: string, method: 'get'|'post'|'delete'|'patch'|'put', data?: Record<string, unknown>): Promise<Response>;
}
