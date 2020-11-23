import type HandlesApiResponse from '../Contracts/HandlesApiResponse';

export default class ApiResponseHandler implements HandlesApiResponse {
    /**
     * @inheritDoc
     */
    public async handle(promise: Promise<Response>): Promise<Record<string, unknown>> {
        return promise
            .then(async (response: Response) => this.handleSuccess(response))
            .catch(error => {
                this.handleError(error);
                return error; // todo - what?
            })
            .finally(() => this.handleFinally());
    }

    /**
     * Parse the data from the response.
     *
     * @param {Response} response
     *
     * @return {Promise<any>}
     */
    public async getData(response: Response): Promise<Record<'data', any>> {
        let body = await response.json();

        if (typeof body === 'string') {
            body = {
                data: body.toLowerCase() === 'true' || body.toLowerCase() === 'false'
                    ? Boolean(body.toLowerCase())
                    : body
            };

        }

        if (body && typeof body === 'object' && 'data' in body) {
            body = body.data;
        }

        return Promise.resolve(body);
    }

    /**
     * Handle successful request.
     *
     * @param {Response} response
     *
     * @return {Promise<any>}
     */
    public async handleSuccess(response: Response): Promise<Record<string, unknown>> {
        return this.getData(response);
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
