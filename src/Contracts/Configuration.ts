import type ApiCaller from './ApiCaller';
import type HandlesApiResponse from './HandlesApiResponse';

/**
 * Interface serves as a typehint to see what might be in the config.
 *
 * @link {GlobalConfig.configuration}
 */
export default interface Configuration {
    /**
     * The ApiCaller constructor.
     *
     * @type {ApiCaller}
     */
    api?: new () => ApiCaller;

    /**
     * The HandlesApiResponse constructor.
     *
     * @type {HandlesApiResponse}
     */
    apiResponseHandler?: new () => HandlesApiResponse;

    /**
     * The date time library to be used.
     *
     * @type {any} - expects a function or class constructor
     */
    datetime?: CallableFunction | (new (arg?: any) => any);

    /**
     * The base url endpoint where the backend api is located.
     */
    baseEndPoint?: string;

    /**
     * The headers to be merged into request configuration.
     */
    headers?: HeadersInit;

    /**
     * The randomisation library made available in the Factory classes if set.
     */
    randomDataGenerator?: any;

    /**
     * Arbitrary value in the config.
     */
    [key: string]: any;
}
