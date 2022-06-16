import ModelCollection from '../ModelCollection';
import LogicException from '../../Exceptions/LogicException';
import GlobalConfig from '../../Support/GlobalConfig';
import API from '../../Services/API';
import ApiResponseHandler from '../../Services/ApiResponseHandler';
import type Model from '../Model';
import type { QueryParams } from './BuildsQuery';
import BuildsQuery from './BuildsQuery';
import type { Attributes, SimpleAttributes } from './HasAttributes';
import { isObjectLiteral, transformKeys } from '../../Support/function';
import { finish, kebab, plural } from '../../Support/string';
import type { MaybeArray, StaticToThis } from '../../Support/type';

/**
 * The request methods.
 */
export type Method =
    'DELETE' | 'delete'
    | 'GET' | 'get'
    | 'HEAD' | 'head'
    | 'PATCH' | 'patch'
    | 'POST' | 'post'
    | 'PUT' | 'put';

/**
 * Key-value pairs of headers where the values can be an array of values.
 * Each value is appended to the outgoing headers.
 */
export type CustomHeaders = Record<string, MaybeArray<string>>;

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

    public constructor() {
        super();
        this.resetEndpoint();
    }

    /**
     * The call method that mediates between the model and api handlers.
     *
     * @param {Method} method
     * @param {object=} data
     * @param {object=} customHeaders
     *
     * @protected
     *
     * @return {Promise<any>}
     */
    public async call<T = any>(
        method: 'GET' | 'get' | 'HEAD' | 'head',
        data?: QueryParams | SimpleAttributes,
        customHeaders?: CustomHeaders
    ): Promise<T | undefined>;
    public async call<T = any>(
        method: Exclude<Method, 'GET' | 'get' | 'HEAD' | 'head'>,
        data?: FormData | SimpleAttributes | SimpleAttributes<this>,
        customHeaders?: CustomHeaders
    ): Promise<T | undefined>;
    public async call<T = any>(
        method: Method,
        data?: FormData | QueryParams | SimpleAttributes<this>,
        customHeaders?: CustomHeaders
    ): Promise<T | undefined> {
        const endpoint = this.getEndpoint();

        if (!endpoint.length) {
            throw new LogicException(
                'Endpoint is not defined when calling \''
                + method + '\' method on \'' + (this as unknown as Model).getName() + '\'.'
            );
        }

        let queryParameters = transformKeys(this.compileQueryParameters(), this.serverAttributeCasing);
        const config = new GlobalConfig;
        const url = (config.get('baseEndPoint') ? finish(config.get('baseEndPoint', '')!, '/') : '')
            + (endpoint.startsWith('/') ? endpoint.slice(1) : endpoint);
        const apiCaller = new (config.get('api', API));
        const handlesApiResponse = new (config.get('apiResponseHandler', ApiResponseHandler))!;

        if (data && isObjectLiteral<SimpleAttributes>(data) && !(data instanceof FormData)) {
            data = transformKeys(data, this.serverAttributeCasing);
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
    // @ts-expect-error - despite TS2526, it still infers correctly
    public async get<T extends Model = this>(
        queryParameters?: QueryParams & Record<string, unknown>
    ): Promise<ModelCollection<T> | T> {
        return this.call('GET', queryParameters)
            .then(responseData => this.newInstanceFromResponseData(
                this.getDataFromResponse<MaybeArray<Attributes<T>>>(responseData)
            ));
    }

    /**
     * The get method made available as a static method.
     *
     * @param {object=} queryParameters - append and/or overwrite query parameter values.
     *
     * @see CallsApi.prototype.get
     */
    public static async get<T extends StaticToThis>(
        this: T,
        queryParameters?: QueryParams & Record<string, unknown>
    ): Promise<ModelCollection<T['prototype']> | T['prototype']> {
        return new this().get(queryParameters);
    }

    /**
     * Send a POST request to the endpoint.
     *
     * @param {object} data
     *
     * @return
     */
    // @ts-expect-error - despite TS2526, it still infers correctly
    public async post<T extends Model = this>(data: FormData | SimpleAttributes | SimpleAttributes<this>): Promise<T> {
        return this.call('POST', data)
            .then(responseData => this.getResponseModel<T>(this.getDataFromResponse(responseData)));
    }

    /**
     * Send a PUT request to the endpoint.
     *
     * @param {object} data
     *
     * @return
     */
    // @ts-expect-error - despite TS2526, it still infers correctly
    public async put<T extends Model = this>(data: FormData | SimpleAttributes | SimpleAttributes<this>): Promise<T> {
        return this.call('PUT', data)
            .then(responseData => this.getResponseModel<T>(this.getDataFromResponse(responseData)));
    }

    /**
     * Send a PATCH request to the endpoint.
     *
     * @param {object} data
     *
     * @return
     */
    // @ts-expect-error - despite TS2526, it still infers correctly
    public async patch<T extends Model = this>(data: FormData | SimpleAttributes | SimpleAttributes<this>): Promise<T> {
        return this.call('PATCH', data)
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
    // @ts-expect-error - despite TS2526, it still infers correctly
    public async delete<T extends Model = this>(
        data?: FormData | SimpleAttributes | SimpleAttributes<this>
    ): Promise<T> {
        return this.call('DELETE', data)
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
    private getResponseModel<T extends Model>(responseData: any): T {
        // returning a collection outside of GET is unexpected.
        return isObjectLiteral<Attributes<T>>(responseData)
            ? this.newInstanceFromResponseData(responseData)
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
    protected newInstanceFromResponseData<T extends Model>(data: Attributes<T>[]): ModelCollection<T>;
    protected newInstanceFromResponseData<T extends Model>(data: Attributes<T>): T;
    protected newInstanceFromResponseData<T extends Model>(data: MaybeArray<Attributes<T>>): ModelCollection<T> | T;
    protected newInstanceFromResponseData<T extends Model>(data: MaybeArray<Attributes<T>>): ModelCollection<T> | T {
        if (data === null
            || data === undefined
            || typeof data !== 'object'
            || Array.isArray(data) && data.some(entry => !isObjectLiteral(entry))
        ) {
            throw new TypeError(
                'Unexpected response type. Ensure that the endpoint returns model data only.'
            );
        }

        const createModel = (attributes: Attributes<T>): T => {
            // pass the attributes to the create method in case the user needs to use it
            return (this.constructor as { new(): T; create: typeof Model['create'] })
                .create<T>(attributes)
                // but do not lose any data from the server due to fillable settings
                .forceFill(attributes)
                .syncOriginal()
                .setLastSyncedAt();
        };

        return Array.isArray(data) ? new ModelCollection(data.map(createModel)) : createModel(data);
    }

    /**
     * Set the last synced at attribute.
     * This is only expected to be used
     * when mocking model to look
     * like it exists.
     *
     * @param {any} to
     *
     * @protected
     *
     * @return {this}
     */
    public setLastSyncedAt(to: unknown = new Date): this {
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
