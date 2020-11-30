import type ModelCollection from '../ModelCollection';
import LogicException from '../../Exceptions/LogicException';
import type ApiCaller from '../../Contracts/ApiCaller';
import Config from '../../Support/Config';
import API from '../../Services/API';
import ApiResponseHandler from '../../Services/ApiResponseHandler';
import type HandlesApiResponse from '../../Contracts/HandlesApiResponse';
import type Model from '../Model';
import BuildsQuery from './BuildsQuery';
import type { Attributes } from './HasAttributes';
import { isObject } from '../../Support/function';

// todo - improve return types (from model to this?)
export default class CallsApi extends BuildsQuery {
    /**
     * The basic endpoint that model queries.
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

    /**
     * Reset the endpoint.
     */
    constructor(attributes?: Attributes) {
        super(attributes); // todo try to move it down the chain to omit the argument
        this.resetEndpoint();
    }

    /**
     * The call method that mediates between the model and api handlers.
     *
     * @param {'get'|'post'|'delete'|'patch'|'put'} method
     * @param {Record<string, any>=} data
     * @param {Record<string, string|string[]>} customHeaders
     *
     * @protected
     *
     * @return {Promise<object>}
     */
    protected async call(
        method: 'get'|'post'|'delete'|'patch'|'put',
        data?: Record<string, unknown>,
        customHeaders?: Record<string, string|string[]>
    ): Promise<any> {
        if (!this.getEndpoint().length) {
            throw new LogicException(
                'Endpoint is not defined when calling \'' + method + '\' method on \'' + this.constructor.name + '\'.'
            );
        }

        this.requestCount++;
        const config = new Config();
        const ApiCaller = config.get('API', new API) as ApiCaller;
        const HandlesApiResponse = config.get('ApiResponseHandler', new ApiResponseHandler) as HandlesApiResponse;

        return HandlesApiResponse.handle(
            ApiCaller.call(
                String(config.get('baseEndPoint', '')) + this.getEndpoint().start('/'),
                method,
                data,
                customHeaders
            )
        )
            .finally(() => this.requestCount--);
    }

    /**
     * Send a GET request to the endpoint.
     *
     * @param {object=} data
     *
     * @return {Promise<Model|ModelCollection<Model>>}
     */
    public async get(data?: Record<string, unknown>): Promise<Model|ModelCollection<Model>> {
        return this.call('get', Object.assign({}, data, this.compileQueryParameters()))
            .then(responseData => {
                this.resetEndpoint();
                this.resetQueryParameters();

                return this.newInstanceFromResponseData(responseData);
            });
    }

    /**
     * The get method made available as a static method.
     *
     * @param {object=} data
     *
     * @see {CallsApi.prototype.get}
     */
    static async get(data?: Record<string, unknown>): Promise<Model|ModelCollection<Model>> {
        return new this().get(data);
    }

    /**
     * Send a POST request to the endpoint.
     *
     * @param {object} data
     *
     * @return
     */
    public async post(data: Record<string, unknown>): Promise<this|Model> {
        return this.call('post', Object.assign({}, data, this.compileQueryParameters()))
            .then(responseData => {
                this.resetEndpoint();
                this.resetQueryParameters();

                return this.getResponseModel(this as unknown as Model, responseData);
            });
    }

    /**
     * Send a PUT request to the endpoint.
     *
     * @param {object} data
     *
     * @return
     */
    public async put(data: Record<string, unknown>): Promise<this|Model> {
        return this.call('put', Object.assign({}, data, this.compileQueryParameters()))
            .then(responseData => {
                this.resetEndpoint();
                this.resetQueryParameters();

                return this.getResponseModel(this as unknown as Model, responseData);
            });
    }

    /**
     * Send a PATCH request to the endpoint.
     *
     * @param {object} data
     *
     * @return
     */
    public async patch(data: Record<string, unknown>): Promise<this|Model> {
        return this.call('patch', Object.assign({}, data, this.compileQueryParameters()))
            .then(responseData => {
                this.resetEndpoint();
                this.resetQueryParameters();

                return this.getResponseModel(this as unknown as Model, responseData);
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
    public async delete(data?: Record<string, unknown>): Promise<this|Model> {
        return this.call('delete', Object.assign({}, data, this.compileQueryParameters()))
            .then(responseData => {
                this.resetEndpoint();
                this.resetQueryParameters();

                return this.getResponseModel(this as unknown as Model, responseData);
            });
    }

    /**
     * Determine whether to return this or a new model from the response.
     *
     * @param {Model} defaultVal
     * @param {object=} responseData
     *
     * @private
     *
     * @return {Model|this}
     */
    private getResponseModel(defaultVal: Model, responseData?: Attributes): this|Model {
        // returning a collection outside of GET is unexpected.
        return isObject(responseData) ? this.newInstanceFromResponseData(responseData) as Model : defaultVal;
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
        data: Attributes|Attributes[]
    ): Model|ModelCollection<Model> {
        if (data === null
            || typeof data !== 'object'
            || Array.isArray(data) && data.some(entry => !isObject(entry))
        ) {
            throw new TypeError(
                'Unexpected response type. Ensure that the endpoint returns model data only.'
            );
        }

        let result: Model|ModelCollection<Model>;

        if (Array.isArray(data)) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-member-access
            const modelCollectionConstructor: new() => ModelCollection<Model> = require('../ModelCollection').default;
            const collection = new modelCollectionConstructor();

            data.forEach(modelData => {
                if (isObject(modelData)) {
                    collection.push(this.forceFilledModel(modelData));
                }
            });

            result = collection;
        } else  {
            result = this.forceFilledModel(data);
        }

        return result;
    }

    /**
     * Create a model and ensure that all data given has been set on the model.
     *
     * @param {object} data
     *
     * @private
     *
     * @return {Model}
     */
    private forceFilledModel(data: Attributes): Model {
        const instance = new (<typeof Model> this.constructor)(data);
        const keysToIgnore = instance.getAttributeKeys().concat(instance.loadedRelationKeys());
        const missingAttributeKeys = Object.keys(data).filter(key => !keysToIgnore.includes(key));

        if (missingAttributeKeys.length) {
            // treat response data as a source of truth and
            // set properties regardless of guarding
            missingAttributeKeys.forEach(key => instance.setAttribute(key, data[key]));
        }

        // todo - set a last synced attribute to tell when the model was last fetched from remote?
        return instance;
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
            : this.constructor.name.toLowerCase().plural();

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
