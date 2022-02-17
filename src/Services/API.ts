import type ApiCaller from '../Contracts/ApiCaller';
import qs from 'qs';
import { isObjectLiteral } from '../Support/function';
import GlobalConfig from '../Support/GlobalConfig';
import { finish } from '../Support/string';
import InvalidArgumentException from '../Exceptions/InvalidArgumentException';
import type { Method, CustomHeaders } from '../Calliope/Concerns/CallsApi';
import type { ApiResponse } from '../Contracts/HandlesApiResponse';

/**
 * The default ApiCaller implementation used by upfrontjs.
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
     *
     * @see https://www.npmjs.com/package/qs
     */
    protected readonly getParamEncodingOptions: qs.IStringifyOptions = {
        arrayFormat: 'indices',
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
        method: 'HEAD' | 'head',
        data?: FormData | Record<string, unknown>,
        customHeaders?: CustomHeaders,
        queryParameters?: Record<string, unknown>
    ): Promise<ApiResponse & { request: { method: 'HEAD' } }>;
    public async call<T>(
        url: string,
        method: Method,
        data?: FormData | Record<string, unknown>,
        customHeaders?: CustomHeaders,
        queryParameters?: Record<string, unknown>
    ): Promise<ApiResponse<T>>;
    public async call(
        url: string,
        method: Method,
        data?: FormData | Record<string, unknown>,
        customHeaders?: CustomHeaders,
        queryParameters?: Record<string, unknown>
    ): Promise<ApiResponse> {
        const config = await this.initConfig(url, method, data, customHeaders, queryParameters);

        return fetch(config.url, config.requestInit).then(resp => {
            return Object.assign(resp, {
                request: config.requestInit
            }) as ApiResponse;
        });
    }

    /**
     * Prepare/compile the ajax call initialisation.
     *
     * @param {string} url - The endpoint the request goes to.
     * @param {Method} method - The method the request uses.
     * @param {object=} data - The optional data to send with the request.
     * @param {object=} customHeaders - Custom headers to merge into the request.
     * @param {object=} queryParameters - The query parameters to append to the url
     *
     * @return {object}
     *
     * @protected
     */
    protected async initConfig(
        url: string,
        method: Method,
        data?: FormData | Record<string, unknown>,
        customHeaders?: CustomHeaders,
        queryParameters?: Record<string, unknown>
    ): Promise<{ url: string; requestInit: RequestInit }> {
        // normalising fetch methods https://fetch.spec.whatwg.org/#concept-method-normalize
        const initOptions: RequestInit = { method: method.toUpperCase() };
        const configHeaders = new Headers(new GlobalConfig().get('headers'));
        queryParameters = queryParameters ?? {};

        // merge in the user provided RequestInit object
        if (isObjectLiteral(this.requestOptions)) {
            Object.assign(initOptions, this.requestOptions);
        }

        // merge in the user provided RequestInit object
        if (this.initRequest && this.initRequest instanceof Function) {
            const initMethodValue = await this.initRequest(url, method, data, queryParameters);

            if (isObjectLiteral(initMethodValue)) {
                Object.assign(initOptions, initMethodValue);
            }
        }

        const headers = new Headers(initOptions.headers);
        configHeaders.forEach((value, name) => {
            headers.append(name, value);
        });

        // ensure method is explicitly set if previously
        // removed by initRequest or requestOptions
        initOptions.method = initOptions.method ?? 'GET';

        if (initOptions.method === 'GET' || initOptions.method === 'HEAD') {
            // if there was a body merged in above,
            // we delete it as GET and HEAD cannot have a body
            delete initOptions.body;
        }

        if (isObjectLiteral(data) && Object.keys(data).length || data instanceof FormData) {
            // if not a GET method
            if (initOptions.method !== 'GET' && initOptions.method !== 'HEAD') {
                if (data instanceof FormData) {
                    // fetch will set the Content-Type https://fetch.spec.whatwg.org/#ref-for-formdata%E2%91%A1
                    initOptions.body = data;
                } else {
                    if (!headers.has('Content-Type')) {
                        headers.set('Content-Type', 'application/json; charset="utf-8"');
                    }
                    initOptions.body = JSON.stringify(data);
                }
            } else {
                // merge in any custom data for appending to the url
                Object.assign(queryParameters, data);
            }
        }

        if (Object.keys(queryParameters).length) {
            url = finish(url, '?') + qs.stringify(queryParameters, this.getParamEncodingOptions);
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
                            'For \'' + header + '\' expected type string, got: ' + typeof value
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
