import type HandlesApiResponse from '../Contracts/HandlesApiResponse';
import { isObject } from '../Support/function';

export default class ApiResponseHandler implements HandlesApiResponse {
    /**
     * @inheritDoc
     */
    public async handle(promise: Promise<Response>): Promise<any> {
        return promise
            .then(async (response: Response) => this.handleSuccess(response))
            .catch(error => this.handleError(error))
            .finally(() => this.handleFinally());
    }

    /**
     * Handle successful request.
     *
     * @param {Response} response
     *
     * @return {Promise<any>}
     */
    public async handleSuccess(response: Response): Promise<any> {
        let responseData = await response.json();

        if (isObject(responseData) && 'data' in responseData) {
            responseData = responseData.data;
        }

        return Promise.resolve(responseData);
    }

    /**
     * Handle errors that occurred during the promise execution.
     *
     * @param {any} rejectReason
     *
     * @return {void}
     */
    public handleError(rejectReason: unknown): void {
        throw new Error('Request has failed with the following message:\n' + String(rejectReason));
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
