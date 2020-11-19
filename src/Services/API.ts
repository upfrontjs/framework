import type ApiCaller from '../Contracts/ApiCaller';

export default class API implements ApiCaller {
    /**
     * Enable indexing object by strings.
     */
    [index: string]: Record<string, unknown> | CallableFunction

    /**
     * The implementation of the call method.
     *
     * @param {string} url
     * @param {'get'|'post'|'delete'|'patch'|'put'} method
     * @param {object?} data
     *
     * @return {Promise<Response>}
     */
    public async call(
        url: string, method: 'get'|'post'|'delete'|'patch'|'put',
        data?: Record<string, unknown>
    ): Promise<Response> {
        const initOptions: RequestInit = {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (this.requestOptions) {
            Object.assign(initOptions, this.requestOptions);
        }

        if (this.initRequest && this.initRequest instanceof Function) {
            Object.assign(initOptions, this.initRequest());
        }

        if (data && Object.keys(data).length) {
            initOptions.body = JSON.stringify(data);
        }

        return fetch(url, initOptions);
    }
}
