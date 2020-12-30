import { merge } from 'lodash';
import type ApiCaller from '../Contracts/ApiCaller';
import type HandlesApiResponse from '../Contracts/HandlesApiResponse';
// import type DateTime from './DateTime/Abstracts/DateTime';

interface Configuration extends Record<string, unknown> {
    api: ApiCaller;
    apiResponseHandler: HandlesApiResponse;
    baseEndPoint: string;
    headers: HeadersInit|Record<string, string|string[]>|string[][];
    randomDataGenerator: any;
    [key: string]: any;
    // DateTime: DateTime;
}

export default class Config {
    /**
     * The configuration object.
     *
     * @protected
     */
    protected static configuration: Partial<Configuration> = {};

    /**
     * The config constructor.
     *
     * @param {object} configuration
     */
    constructor(configuration?: Partial<Configuration>) {
        if (configuration) {
            merge(Config.configuration, configuration);
        }
    }

    /**
     * Get a value from the config.
     *
     * @param {string} key
     * @param {any=}   defaultVal
     */
    public get<T>(key: keyof Configuration|string, defaultVal?: T): unknown|T {
        return Config.configuration[key] ?? defaultVal;
    }

    /**
     * Determine whether a key is set in the config or not.
     *
     * @param {string} key
     */
    public has(key: keyof Configuration|string): boolean {
        return !!Config.configuration[key] || typeof Config.configuration[key] === 'boolean';
    }

    /**
     * Set a config value.
     *
     * @param {string} key
     * @param {any}    value
     *
     * @return {this}
     */
    public set(key: keyof Configuration|string, value: unknown): this {
        Config.configuration[key] = value;

        return this;
    }

    /**
     * Remove a config value.
     *
     * @param {string} key
     *
     * @return {this}
     */
    public unset(key: keyof Configuration|string): this {
        if (this.has(key)) {
            delete Config.configuration[key];
        }

        return this;
    }

    /**
     * Empty the configuration.
     *
     * @return {this}
     */
    public reset(): this {
        Config.configuration = {};

        return this;
    }
}
