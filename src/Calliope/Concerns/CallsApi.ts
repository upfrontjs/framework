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
import { finish, plural, snake, camel } from '../../Support/string';
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
     * Property indicating how attributes and relation names
     * should be casted by default when sent to the server.
     *
     * @type {'snake'|'camel'}
     *
     * @protected
     */
    protected get serverAttributeCasing(): 'camel' | 'snake' {
        return 'snake';
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
    protected async call<T = any>(
        method: Method,
        data?: Attributes | FormData,
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
            const setStringCase = (key: string) => this.serverAttributeCasing === 'camel' ? camel(key) : snake(key);
            const dataWithKeyCasing: Attributes = {};

            Object.keys(object).forEach(key => {
                dataWithKeyCasing[setStringCase(key)] = isObjectLiteral(object[key])
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
            
            
            .finally(() => this.requestCount--);
    }

    /**
     * Send a GET request to the endpoint.
     *
     * @param {object=} queryParameters} - append and/or overwrite query parameter values.
     *
     * @return {Promise<Model|ModelCollection<Model>>}
     */
    public async get(queryParameters?: QueryParams | Record<string, unknown>): Promise<Model | ModelCollection<Model>> {
        return this.call('get', queryParameters)
            .then(responseData => {
                this.resetEndpoint().resetQueryParameters();

                return this.newInstanceFromResponseData(responseData as Attributes);
            });
    }

    /**
     * The get method made available as a static method.
     *
     * @param {object=} queryParameters - append and/or overwrite query parameter values.
     *
     * @see CallsApi.prototype.get
     */
    public static async get(
        queryParameters?: QueryParams | Record<string, unknown>
    ): Promise<Model | ModelCollection<Model>> {
        return new this().get(queryParameters);
    }

    /**
     * Send a POST request to the endpoint.
     *
     * @param {object} data
     *
     * @return
     */
    public async post(data: FormData | Record<string, unknown>): Promise<Model> {
        return this.call('post', data)
            .then(responseData => {
                return this.resetEndpoint()
                    .resetQueryParameters()
                    .getResponseModel(responseData);
            });
    }

    /**
     * Send a PUT request to the endpoint.
     *
     * @param {object} data
     *
     * @return
     */
    public async put(data: FormData | Record<string, unknown>): Promise<Model> {
        return this.call('put', data)
            .then(responseData => {
                return this.resetEndpoint()
                    .resetQueryParameters()
                    .getResponseModel(responseData);
            });
    }

    /**
     * Send a PATCH request to the endpoint.
     *
     * @param {object} data
     *
     * @return
     */
    public async patch(data: FormData | Record<string, unknown>): Promise<Model> {
        return this.call('patch', data)
            .then(responseData => {
                return this.resetEndpoint()
                    .resetQueryParameters()
                    .getResponseModel(responseData);
            });
    }

    /**
     * Send a DELETE request to the endpoint.
     * Returns true on success otherwise false.
     *
     * @param {object=} data
     *
     * @return {Promise<boolean>}
     */
    public async delete(data?: FormData | Record<string, unknown>): Promise<Model> {
        return this.call('delete', data)
            .then(responseData => {
                return this.resetEndpoint()
                    .resetQueryParameters()
                    .getResponseModel(responseData);
            });
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
    private getResponseModel(responseData: Attributes | any): Model {
        // returning a collection outside of GET is unexpected.
        return isObjectLiteral(responseData)
            ? this.newInstanceFromResponseData(responseData) as Model
            : this as unknown as Model;
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
    protected newInstanceFromResponseData(
        data: MaybeArray<Attributes>
    ): Model | ModelCollection<Model> {
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
            const collection = new ModelCollection();

            data.forEach(attributes => {
                const model = new (this.constructor as typeof Model)();
                collection.push(model.forceFill(attributes).syncOriginal().setLastSyncedAt());
            });

            return collection;
        }

        const model = new (this.constructor as typeof Model)();
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
    protected setLastSyncedAt(to: any = new Date): this {
        const key = '_' + this.setStringCase('last_synced_at');

        if (key in this) {
            delete this[key];
        }

        Object.defineProperty(this, key, {
            get: () => to,
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
            : plural((this as unknown as Model).getName().toLowerCase());

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
