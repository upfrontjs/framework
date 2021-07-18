import type ApiCaller from '../Contracts/ApiCaller';
import qs from 'qs';
import { isObjectLiteral } from '../Support/function';
import GlobalConfig from '../Support/GlobalConfig';
import { finish } from '../Support/string';
import InvalidArgumentException from '../Exceptions/InvalidArgumentException';

/**
 * The default ApiCaller class used by the package.
 *
 * @link {ApiCaller}
 */
export default class API implements ApiCaller {
    /**
     * Enable indexing object by strings.
     */
    [index: string]: CallableFunction | qs.IStringifyOptions | Record<string, unknown>

    /**
     * The settings for the parsing of the get parameters.
     *
     * @protected
     */
    protected readonly getParamEncodingOptions: qs.IStringifyOptions = {
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
        method: 'delete' | 'get' | 'patch' | 'post' | 'put',
        data?: FormData | Record<string, any>,
        customHeaders?: Record<string, string[] | string>
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
        method: 'delete' | 'get' | 'patch' | 'post' | 'put',
        data?: FormData | Record<string, any>,
        customHeaders?: Record<string, string[] | string>
    ): { url: string; requestInit: RequestInit } {
        const initOptions: RequestInit = { method: method.toLowerCase() };
        const configHeaders = new Headers(new GlobalConfig().get('headers'));

        // merge in the user provided RequestInit object
        if (isObjectLiteral(this.requestOptions)) {
            Object.assign(initOptions, this.requestOptions);
        }

        // merge in the user provided RequestInit object
        if (this.initRequest && this.initRequest instanceof Function) {
            const initMethodValue = this.initRequest(url, method, data);

            if (isObjectLiteral(initMethodValue)) {
                Object.assign(initOptions, initMethodValue);
            }
        }

        const headers = new Headers(initOptions.headers);
        configHeaders.forEach((value, name) => {
            headers.append(name, value);
        });

        // if explicitly or implicitly a GET method
        if (!initOptions.method || initOptions.method === 'get') {
            // given if there was any body it was merged in above,
            // we delete it as GET cannot have a body
            delete initOptions.body;
        }

        if (isObjectLiteral(data) && Object.keys(data).length || data instanceof FormData) {
            // if not a GET method
            if (initOptions.method && initOptions.method !== 'get') {
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
                url = finish(url, '?') + qs.stringify(data, this.getParamEncodingOptions);
            }
        }

        // append passed in custom headers
        if (isObjectLiteral(customHeaders)) {
            Object.keys(customHeaders).forEach(header => {
                let headerValues = customHeaders[header]!;

                if (!Array.isArray(headerValues)) {
                    headerValues = [headerValues];
                }

                headerValues.forEach(value => {
                    if (typeof value !== 'string') {
                        throw new InvalidArgumentException(
                            'For \'' + header + '\' expected type sting, got: ' + typeof value
                        );
                    }

                    headers.append(header, value);
                });
            });
        }

        if (!headers.has('Accept')) {
            headers.set('Accept', 'application/json');
        }

        initOptions.headers = headers;

        return { url: url, requestInit: initOptions };
    }
}
