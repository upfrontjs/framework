import type ApiCaller from './ApiCaller';
import type HandlesApiResponse from './HandlesApiResponse';
import type DateTimeInterface from './DateTimeInterface';

/**
 * Interface serves as a typehint to see what might be in the config.
 *
 * @link {Config.configuration}
 */
export default interface Configuration extends Record<string, unknown> {
    /**
     * The ApiCaller instance.
     *
     * @type {ApiCaller}
     */
    api?: ApiCaller;

    /**
     * The HandlesApiResponse instance.
     *
     * @type {HandlesApiResponse}
     */
    apiResponseHandler?: HandlesApiResponse;

    /**
     * The DateTimeInterface instance.
     *
     * @type {DateTimeInterface}
     */
    dateTime?: DateTimeInterface;

    /**
     * The base url endpoint where the backend api is located.
     */
    baseEndPoint?: string;

    /**
     * The headers to be merged into request configuration.
     */
    headers?: HeadersInit|Record<string, string|string[]>|string[][];

    /**
     * The randomisation library made available in the Factory classes if set.
     */
    randomDataGenerator?: any;

    /**
     * Enable any arbitrary values in the config.
     */
    [key: string]: any;
}
