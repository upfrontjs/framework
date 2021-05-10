import ModelCollection from '../ModelCollection';
import LogicException from '../../Exceptions/LogicException';
import GlobalConfig from '../../Support/GlobalConfig';
import API from '../../Services/API';
import ApiResponseHandler from '../../Services/ApiResponseHandler';
import type Model from '../Model';
import BuildsQuery from './BuildsQuery';
import type { Attributes } from './HasAttributes';
import { isObjectLiteral } from '../../Support/function';
import { finish, plural, snake, camel } from '../../Support/string';

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
     * @return {Promise<object>}
     */
    protected async call(
        method: 'delete' | 'get' | 'patch' | 'post' | 'put',
        data?: Attributes | FormData,
        customHeaders?: Record<string, string[] | string>
    ): Promise<any> {
        if (!this.getEndpoint().length) {
            throw new LogicException(
                'Endpoint is not defined when calling \''
                + method + '\' method on \'' + (this as unknown as Model).getName() + '\'.'
            );
        }

        const config = new GlobalConfig;
        const url = finish(String(config.get('baseEndPoint', '')), '/')
            + (this.getEndpoint().startsWith('/') ? this.getEndpoint().slice(1) : this.getEndpoint());
        const apiCaller = new (config.get('api', API))!;
        const handlesApiResponse = new (config.get('apiResponseHandler', ApiResponseHandler))!;

        if (data && isObjectLiteral<Attributes>(data) && !(data instanceof FormData)) {
            const setStringCase = (key: string) => this.serverAttributeCasing === 'camel' ? camel(key) : snake(key);
            const transformValues = (object: Attributes): Attributes => {
                const dataWithKeyCasing: Attributes = {};

                Object.keys(object).map(key => {
                    dataWithKeyCasing[setStringCase(key)] = object[key] && isObjectLiteral(object[key])
                        ? transformValues(object[key] as Attributes)
                        : object[key];
                });

                return dataWithKeyCasing;
            };

            data = transformValues(data);
        }

        this.requestCount++;

        return handlesApiResponse
            .handle(
                apiCaller.call(url, method, data, customHeaders)
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
    public async get(data?: Record<string, unknown>): Promise<Model | ModelCollection<Model>> {
        return this.call('get', Object.assign({}, data, this.compileQueryParameters()))
            .then(responseData => {
                this.resetEndpoint().resetQueryParameters();

                return this.newInstanceFromResponseData(responseData as Attributes);
            });
    }

    /**
     * The get method made available as a static method.
     *
     * @param {object=} data
     *
     * @see CallsApi.prototype.get
     */
    public static async get(data?: Record<string, unknown>): Promise<Model | ModelCollection<Model>> {
        return new this().get(data);
    }

    /**
     * Send a POST request to the endpoint.
     *
     * @param {object} data
     *
     * @return
     */
    public async post(data: FormData | Record<string, unknown>): Promise<Model> {
        return this.call('post', Object.assign({}, data, this.compileQueryParameters()))
            .then(responseData => {
                this.resetEndpoint().resetQueryParameters();

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
    public async put(data: FormData | Record<string, unknown>): Promise<Model> {
        return this.call('put', Object.assign({}, data, this.compileQueryParameters()))
            .then(responseData => {
                this.resetEndpoint().resetQueryParameters();

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
    public async patch(data: FormData | Record<string, unknown>): Promise<Model> {
        return this.call('patch', Object.assign({}, data, this.compileQueryParameters()))
            .then(responseData => {
                this.resetEndpoint().resetQueryParameters();

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
    public async delete(data?: FormData | Record<string, unknown>): Promise<Model> {
        return this.call('delete', Object.assign({}, data, this.compileQueryParameters()))
            .then(responseData => {
                this.resetEndpoint().resetQueryParameters();

                return this.getResponseModel(this as unknown as Model, responseData);
            });
    }

    /**
     * Set the correct endpoint and initiate a patch request.
     *
     * @param {object} data
     *
     * @see CallsApi.prototype.patch
     */
    public async update(data: Attributes): Promise<Model> {
        return this.setEndpoint(finish(this.getEndpoint(), '/') + String((this as unknown as Model).getKey()))
            .patch(data);
    }

    /**
     * Determine whether to return this or a new model from the response.
     *
     * @param {Model} defaultVal
     * @param {object|any} responseData
     *
     * @private
     *
     * @return {Model|this}
     */
    private getResponseModel(defaultVal: Model, responseData: Attributes | any): Model {
        // returning a collection outside of GET is unexpected.
        return isObjectLiteral(responseData) ? this.newInstanceFromResponseData(responseData) as Model : defaultVal;
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
        data: Attributes | Attributes[]
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

        let result: Model | ModelCollection<Model>;

        if (Array.isArray(data)) {
            const collection = new ModelCollection();

            data.forEach(attributes => {
                const model = new (this.constructor as typeof Model)();
                collection.push(model.forceFill(attributes).syncOriginal().setLastSyncedAt());
            });

            result = collection;
        } else {
            const model = new (this.constructor as typeof Model)();
            result = model.forceFill(data).syncOriginal().setLastSyncedAt();
        }

        return result;
    }

    /**
     * Set the last synced at attribute.
     *
     * @param {any} to
     * @param {Model} model
     *
     * @protected
     *
     * @return {this}
     */
    protected setLastSyncedAt(to: any = new Date, model?: Model): this {
        model = model ?? (this as unknown as Model);
        const key = '_' + this.setStringCase('last_synced_at');

        if (key in model) {
            delete model[key];
        }

        Object.defineProperty(model, key, {
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
