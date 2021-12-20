import ModelCollection from '../ModelCollection';
import LogicException from '../../Exceptions/LogicException';
import GlobalConfig from '../../Support/GlobalConfig';
import API from '../../Services/API';
import ApiResponseHandler from '../../Services/ApiResponseHandler';
import type Model from '../Model';
import type { QueryParams } from './BuildsQuery';
import BuildsQuery from './BuildsQuery';
import type { Attributes } from './HasAttributes';
import { isObjectLiteral } from '../../Support/function';
import { finish, kebab, plural } from '../../Support/string';
import type { MaybeArray } from '../../Support/type';

export type Method = 'delete' | 'get' | 'patch' | 'post' | 'put';

export default class CallsApi extends BuildsQuery {
    /**
     * The basic endpoint that model queries.
     *
     * @type {string}
     *
     * @protected
     */
    protected get endpoint(): string {
        return '';
    }

    /**
     * The endpoint used when querying the api.
     *
     * @protected
     */
    protected mutatedEndpoint = '';

    /**
     * Boolean flag indicating whether there is an ongoing request or not.
     *
     * @type {boolean}
     */
    public get loading(): boolean {
        return this.requestCount > 0;
    }

    /**
     * Indication of the number of request currently ongoing on this class.
     *
     * @private
     *
     * @type {number}
     */
    private requestCount = 0;

    public constructor(attributes?: Attributes) {
        super(attributes);
        this.resetEndpoint();
    }

    /**
     * The call method that mediates between the model and api handlers.
     *
     * @param {'get'|'post'|'delete'|'patch'|'put'} method
     * @param {object=} data
     * @param {object=} customHeaders
     *
     * @protected
     *
     * @return {Promise<any>}
     */
    public async call<T = any>(
        method: Method,
        data?: Attributes | FormData | QueryParams,
        customHeaders?: Record<string, MaybeArray<string>>
    ): Promise<T | undefined> {
        const endpoint = this.getEndpoint();

        if (!endpoint.length) {
            throw new LogicException(
                'Endpoint is not defined when calling \''
                + method + '\' method on \'' + (this as unknown as Model).getName() + '\'.'
            );
        }

        /**
         * Recursively format the keys according to serverAttributeCasing
         *
         * @see CallsApi.prototype.serverAttributeCasing
         */
        const transformValues = (object: Attributes): Attributes => {
            const dataWithKeyCasing: Attributes = {};

            Object.keys(object).forEach(key => {
                dataWithKeyCasing[this.setServerStringCase(key)] = isObjectLiteral(object[key])
                    ? transformValues(object[key] as Attributes)
                    : object[key];
            });

            return dataWithKeyCasing;
        };

        let queryParameters = transformValues(this.compileQueryParameters());
        const config = new GlobalConfig;
        const url = (config.get('baseEndPoint') ? finish(config.get('baseEndPoint', '')!, '/') : '')
            + (endpoint.startsWith('/') ? endpoint.slice(1) : endpoint);
        const apiCaller = new (config.get('api', API));
        const handlesApiResponse = new (config.get('apiResponseHandler', ApiResponseHandler))!;

        if (data && isObjectLiteral<Attributes>(data) && !(data instanceof FormData)) {
            data = transformValues(data);
        }

        const requestMiddleware = config.get('requestMiddleware');

        if (requestMiddleware) {
            const result = await requestMiddleware.handle(url, method, data, customHeaders, queryParameters);
            // values are either undefined or objects
            if ('data' in result && result.data === undefined
                || isObjectLiteral(result.data)) {
                data = result.data;
            }

            if ('customHeaders' in result && result.customHeaders === undefined
                || isObjectLiteral(result.customHeaders)) {
                customHeaders = result.customHeaders;
            }

            if ('queryParameters' in result && result.queryParameters === undefined
                || isObjectLiteral(result.queryParameters)) {
                queryParameters = result.queryParameters!;
            }
        }

        this.requestCount++;

        return handlesApiResponse
            .handle<T>(apiCaller.call(url, method, data, customHeaders, queryParameters))
            .finally(() => {
                this.requestCount--;
                this.resetEndpoint();
                this.resetQueryParameters();
            });
    }

    /**
     * Access the data property if exists.
     *
     * @param {any} response
     *
     * @private
     *
     * @return {any}
     */
    private getDataFromResponse<T>(response: any): T {
        if (isObjectLiteral<{ data: any }>(response) && 'data' in response) {
            return response.data;
        }

        return response;
    }

    /**
     * Send a GET request to the endpoint.
     *
     * @param {object=} queryParameters} - append and/or overwrite query parameter values.
     *
     * @return {Promise<Model|ModelCollection<Model>>}
     */
    public async get<T extends Model>(
        queryParameters?: QueryParams | Record<string, unknown>
    ): Promise<ModelCollection<T> | T> {
        return this.call('get', queryParameters)
            .then(responseData => this.newInstanceFromResponseData<T>(this.getDataFromResponse(responseData)));
    }

    /**
     * The get method made available as a static method.
     *
     * @param {object=} queryParameters - append and/or overwrite query parameter values.
     *
     * @see CallsApi.prototype.get
     */
    public static async get<T extends Model>(
        queryParameters?: QueryParams | Record<string, unknown>
    ): Promise<ModelCollection<T> | T> {
        return new this().get<T>(queryParameters);
    }

    /**
     * Send a POST request to the endpoint.
     *
     * @param {object} data
     *
     * @return
     */
    public async post<T extends Model>(data: Attributes | FormData): Promise<T> {
        return this.call('post', data)
            .then(responseData => this.getResponseModel<T>(this.getDataFromResponse(responseData)));
    }

    /**
     * Send a PUT request to the endpoint.
     *
     * @param {object} data
     *
     * @return
     */
    public async put<T extends Model>(data: Attributes | FormData): Promise<T> {
        return this.call('put', data)
            .then(responseData => this.getResponseModel<T>(this.getDataFromResponse(responseData)));
    }

    /**
     * Send a PATCH request to the endpoint.
     *
     * @param {object} data
     *
     * @return
     */
    public async patch<T extends Model>(data: Attributes | FormData): Promise<T> {
        return this.call('patch', data)
            .then(responseData => this.getResponseModel<T>(this.getDataFromResponse(responseData)));
    }

    /**
     * Send a DELETE request to the endpoint.
     * Returns true on success otherwise false.
     *
     * @param {object=} data
     *
     * @return {Promise<boolean>}
     */
    public async delete<T extends Model>(data?: Attributes | FormData): Promise<T> {
        return this.call('delete', data)
            .then(responseData => this.getResponseModel<T>(this.getDataFromResponse(responseData)));
    }

    /**
     * Determine whether to return this or a new model from the response.
     *
     * @param {object|any} responseData
     *
     * @private
     *
     * @return {Model|this}
     */
    private getResponseModel<T extends Model>(responseData: Attributes | any): T {
        // returning a collection outside of GET is unexpected.
        return isObjectLiteral(responseData)
            ? this.newInstanceFromResponseData(responseData) as T
            : this as unknown as T;
    }

    /**
     * Parse the data into a model or model collection.
     *
     * @param {object} data
     *
     * @protected
     *
     * @return {Model}
     */
    protected newInstanceFromResponseData<T extends Model>(
        data: MaybeArray<Attributes>
    ): ModelCollection<T> | T {
        if (data === null
            || data === undefined
            || typeof data !== 'object'
            || Array.isArray(data) && data.some(entry => !isObjectLiteral(entry))
        ) {
            throw new TypeError(
                'Unexpected response type. Ensure that the endpoint returns model data only.'
            );
        }

        if (Array.isArray(data)) {
            const collection = new ModelCollection<T>();

            data.forEach(attributes => {
                const model = new (this.constructor as new () => T)();
                collection.push(model.forceFill(attributes).syncOriginal().setLastSyncedAt());
            });

            return collection;
        }

        const model = new (this.constructor as new () => T)();
        return model.forceFill(data).syncOriginal().setLastSyncedAt();
    }

    /**
     * Set the last synced at attribute.
     *
     * @param {any} to
     *
     * @protected
     *
     * @return {this}
     */
    protected setLastSyncedAt(to: unknown = new Date): this {
        const key = '_' + this.setStringCase('last_synced_at');

        Object.defineProperty(this, key, {
            // @ts-expect-error
            get: () => this.castToDateTime(key, to),
            configurable: true,
            enumerable: true
        });

        return this;
    }

    /**
     * Set the endpoint for the model.
     *
     * @param {string} url
     *
     * @return {string}
     */
    public setEndpoint(url: string): this {
        this.mutatedEndpoint = url;

        return this;
    }

    /**
     * Get the endpoint for the model.
     *
     * @return {string}
     */
    public getEndpoint(): string {
        return this.mutatedEndpoint;
    }

    /**
     * Reset the endpoint to the original expected string.
     *
     * @return {this}
     */
    public resetEndpoint(): this {
        this.mutatedEndpoint = typeof this.endpoint === 'string' && this.endpoint.length
            ? this.endpoint
            : plural(kebab((this as unknown as Model).getName()).toLowerCase());

        return this;
    }

    /**
     * Add a string to the end of the string.
     *
     * @param string
     *
     * @return {this}
     */
    public appendToEndpoint(string: string): this {
        this.mutatedEndpoint += string;

        return this;
    }
}
