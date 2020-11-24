import type ApiCaller from '../Contracts/ApiCaller';
import qs from 'qs';
import type { IStringifyOptions } from 'qs';

export default class API implements ApiCaller {
    /**
     * Enable indexing object by strings.
     */
    [index: string]: Record<string, unknown> | CallableFunction | IStringifyOptions

    /**
     * The settings for the parsing of the get parameters.
     *
     * @protected
     */
    protected readonly getParamEncodingOptions: IStringifyOptions = {
        arrayFormat: 'brackets',
        strictNullHandling: true,
        indices: true,
        encodeValuesOnly: true,
        charset: 'utf-8'
    };

    /**
     * The implementation of the expected call method.
     *
     * @inheritDoc
     */
    public async call(
        url: string,
        method: 'get'|'post'|'delete'|'patch'|'put',
        data?: Record<string, any>,
        customHeaders?: Record<string, string|string[]>
    ): Promise<Response> {
        const config = this.initConfig(url, method, data, customHeaders);

        return fetch(config.url, config.requestInit);
    }

    /**
     * Prepare/compile the ajax call initialisation.
     *
     * @param {string} url - The endpoint the request goes to.
     * @param {'get' | 'post' | 'delete' | 'patch' | 'put'} method - The method the request uses.
     * @param {object=} data - The optional data to send with the request.
     * @param {object=} customHeaders - Custom headers to merge into the request.
     *
     * @return {Promise<Response>}
     *
     * @protected
     */
    protected initConfig(
        url: string,
        method: 'get'|'post'|'delete'|'patch'|'put',
        data?: Record<string, any>,
        customHeaders?: Record<string, string|string[]>
    ): { url: string; requestInit: RequestInit } {
        const initOptions: RequestInit = { method };

        // merge in the user provided RequestInit object
        if (this.requestOptions) {
            Object.assign(initOptions, this.requestOptions);
        }

        // merge in the user provided RequestInit object
        if (this.initRequest && this.initRequest instanceof Function) {
            const initMethodValue = this.initRequest(url, method, data);

            // only merge if it is in fact an object
            if (initOptions && typeof initMethodValue === 'object') {
                Object.assign(initOptions, initMethodValue);
            }
        }

        const headers = new Headers(initOptions.headers);

        // if explicitly or implicitly a GET method
        if (!initOptions.method || initOptions.method.toLowerCase() === 'get') {
            // if it was merged in above, we delete it to avoid:
            // TypeError: Request with GET/HEAD method cannot have body
            delete initOptions.body;
        }

        if (data) {
            // if not a GET method
            if (initOptions.method && initOptions.method.toLowerCase() !== 'get') {
                if (data instanceof FormData) {
                    headers.set('Content-Type', 'multipart/form-data');
                    initOptions.body = data;
                } else {
                    headers.set('Content-Type', 'application/json; charset=UTF-8');
                    initOptions.body = JSON.stringify(data);
                }
            } else {
                headers.set(
                    'Content-Type',
                    'application/x-www-form-urlencoded; charset=' + String(this.getParamEncodingOptions.charset)
                );
                url = url.finish('?') + qs.stringify(data, this.getParamEncodingOptions);
            }
        }

        // append passed in custom headers
        if (customHeaders && typeof customHeaders === 'object') {
            Object.keys(customHeaders).forEach(header => {
                const headerValue = customHeaders[header];

                if (Array.isArray(headerValue)) {
                    headerValue.forEach(value => headers.append(header, value));
                } else {
                    headers.append(header, headerValue);
                }
            });
        }

        initOptions.headers = headers;

        return { url: url, requestInit: initOptions };
    }
}
