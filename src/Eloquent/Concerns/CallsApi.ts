import type ModelCollection from '../ModelCollection';
import LogicException from '../../Exceptions/LogicException';
import type ApiCaller from '../../Contracts/ApiCaller';
import Config from '../../Support/Config';
import API from '../../Services/API';
import ApiResponseHandler from '../../Services/ApiResponseHandler';
import type HandlesApiResponse from '../../Contracts/HandlesApiResponse';
import type Model from '../Model';
import BuildsQuery from './BuildsQuery';

export default class CallsApi extends BuildsQuery {
    /**
     * The basic endpoint that model should you.
     */
    public get endpoint(): string {
        return '';
    }

    /**
     * The endpoint used when querying the api.
     *
     * @protected
     */
    protected mutatedEndpoint = '';

    /**
     * The class responsible for making api calls.
     *
     * @protected
     */
    protected static API: ApiCaller | undefined;

    /**
     * The provided response handler used to parse out the response.
     *
     * @protected
     */
    protected static ApiResponseHandler: HandlesApiResponse | undefined;

    /**
     * Boolean flag indicating whether there is an ongoing request or not.
     *
     * @type {boolean}
     */
    public loading = false;

    /**
     * Reset the endpoint.
     */
    constructor(attributes?: Record<string, unknown>) {
        super(attributes); // todo try to move it down the chain to omit the argument
        this.resetEndpoint();
    }

    /**
     * The call method that mediates between the model and api handlers.
     *
     * @param {'get'|'post'|'delete'|'patch'|'put'} method
     * @param {Record<string, any>?} data
     *
     * @protected
     */
    protected async call(
        method: 'get'|'post'|'delete'|'patch'|'put',
        data?: Record<string, unknown>
    ): Promise<Record<string, unknown>|Record<string, unknown>[]> {
        if (!this.getEndpoint().length) {
            throw new LogicException(
                'Endpoint has not been defined for this \'' + method + '\' method on ' + this.constructor.name
            );
        }

        this.loading = true;
        const config = new Config();

        if (!CallsApi.API) {
            CallsApi.API = config.get('API', new API) as ApiCaller;
        }

        if (!CallsApi.ApiResponseHandler) {
            CallsApi.ApiResponseHandler = config.get(
                'ApiResponseHandler',
                new ApiResponseHandler
            ) as HandlesApiResponse;
        }

        return CallsApi.ApiResponseHandler.handle(
            CallsApi.API.call(
                String(config.get('baseEndPoint', '')).finish('/') + this.getEndpoint(),
                method,
                data
            )
        )
            .then(response => {
                this.loading = false;
                return response;
            });
    }

    /**
     * Send a GET request to the endpoint.
     *
     * @param {object?} data
     *
     * @return {Promise<undefined | Model | ModelCollection<Model>>}
     */
    public async get(data?: Record<string, unknown>): Promise<Model | ModelCollection<Model>> {
        const responseData = await this.call('get', Object.assign({}, data, this.compileQueryParameters()));

        this.syncOriginal();
        this.resetEndpoint();
        this.resetQueryParameters();

        return Promise.resolve(this.newInstanceFromResponse(responseData));
    }

    /**
     * The get method made available as a static method.
     *
     * @param {object?} data
     *
     * @see {CallsApi.prototype.get}
     */
    static async get(data?: Record<string, unknown>): Promise<undefined | Model | ModelCollection<Model>> {
        return new this().get(data);
    }

    /**
     * Send a POST request to the endpoint.
     *
     * @param {object} data
     *
     * @return
     */
    public async post(data: Record<string, unknown>): Promise<this> {
        return this.call('post', Object.assign({}, data, this.compileQueryParameters()))
            .then(() => {
                this.syncOriginal();
                this.resetEndpoint();
                this.resetQueryParameters();

                return this;
            });
    }

    /**
     * Send a PUT request to the endpoint.
     *
     * @param {object} data
     *
     * @return
     */
    public async put(data: Record<string, unknown>): Promise<this> {
        return this.call('put', Object.assign({}, data, this.compileQueryParameters()))
            .then(() => {
                this.syncOriginal();
                this.resetEndpoint();
                this.resetQueryParameters();

                return this;
            });
    }

    /**
     * Send a PATCH request to the endpoint.
     *
     * @param {object} data
     *
     * @return
     */
    public async patch(data: Record<string, unknown>): Promise<this> {
        return this.call('patch', Object.assign({}, data, this.compileQueryParameters()))
            .then(() => {
                this.syncOriginal();
                this.resetEndpoint();
                this.resetQueryParameters();

                return this;
            });
    }

    /**
     * Send a DELETE request to the endpoint.
     * Returns true on success otherwise false.
     *
     * @param {object?} data
     *
     * @return {Promise<boolean>}
     */
    public async delete(data?: Record<string, unknown>): Promise<boolean> {
        return this.call('delete', Object.assign({}, data, this.compileQueryParameters()))
            .then(() => {
                this.syncOriginal();
                this.resetEndpoint();
                this.resetQueryParameters();

                return true;
            })
            .catch(() => false);
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
    protected newInstanceFromResponse(
        data: Record<string, unknown>|Record<string, unknown>[]
    ): Model|ModelCollection<Model> {
        if (Array.isArray(data)) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const modelCollectionConstructor: new() => ModelCollection<Model> = require('../ModelCollection');
            const collection = new modelCollectionConstructor();

            data.forEach(modelData => collection.push(new (<typeof Model> this.constructor)(modelData)));

            return collection;
        }

        return new (<typeof Model> this.constructor)(data);
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
        this.mutatedEndpoint = this.endpoint.length ? this.endpoint : this.constructor.name.toLowerCase().plural();

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
