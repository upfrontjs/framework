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
    handle(promise: Promise<Response>): Promise<any>;
}
