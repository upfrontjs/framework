import type ApiCaller from './ApiCaller';
import type HandlesApiResponse from './HandlesApiResponse';
import type RequestMiddleware from './RequestMiddleware';

/**
 * Interface serves as a typehint to see what might be in the config.
 *
 * @link {GlobalConfig.configuration}
 */
export default interface Configuration {
    /**
     * The ApiCaller used by the library.
     */
    api?: new () => ApiCaller;

    /**
     * The HandlesApiResponse used by the library.
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
     * Middleware executed just before values being passed to the ApiCaller
     *
     * @see {CallsApi.prototype.call}
     */
    requestMiddleware?: RequestMiddleware;
}
