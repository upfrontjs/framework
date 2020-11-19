export default interface HandlesApiResponse {
    /**
     * Handle the promised response.
     *
     * @param promise
     *
     * @return {Promise<any>}
     */
    handle(promise: Promise<Response>): Promise<any>;
}
