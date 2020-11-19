import merge from 'lodash/merge';
import type ApiCaller from '../Contracts/ApiCaller';
import type HandlesApiResponse from '../Contracts/HandlesApiResponse';
// import type AbstractDateTime from './DateTime/Abstracts/AbstractDateTime';

interface Configuration extends Record<string, unknown> {
    API: ApiCaller;
    ApiResponseHandler: HandlesApiResponse;
    baseEndPoint: string;
    [key: string]: any;
    // DateTime: AbstractDateTime;
}

class Config {
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
     * @param {any?}   defaultVal
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
     */
    public set(key: keyof Configuration|string, value: unknown): this {
        Config.configuration[key] = value;

        return this;
    }

    /**
     * Remove a config value.
     *
     * @param {string} key
     */
    public unset(key: keyof Configuration|string): this {
        if (this.has(key)) {
            delete Config.configuration[key];
        }

        return this;
    }
}

export default Config;


