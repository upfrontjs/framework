import GlobalConfig from '../src/Support/GlobalConfig';
import type Configuration from '../src/Contracts/Configuration';
import { beforeEach, jest } from '@jest/globals';
// for some reason global.Promise not found when referenced within node-fetch
global.Promise = globalThis.Promise;
// eslint-disable-next-line @typescript-eslint/no-redeclare
import fetch, { Response, Headers, Request } from 'cross-fetch';

globalThis.fetch = fetch;
globalThis.Response = Response;
globalThis.Headers = Headers;
globalThis.Request = Request;

/* eslint-disable-next-line @typescript-eslint/consistent-generic-constructors */
export const config: GlobalConfig<Configuration> = new GlobalConfig;

/* eslint-disable jest/require-hook */
export const now = new Date(jest.getRealSystemTime());
jest.useFakeTimers({ now });
config.set('baseEndPoint', 'https://test-api-endpoint.com');
/* eslint-enable jest/require-hook */

// eslint-disable-next-line jest/require-top-level-describe
beforeEach(() => {
    config.reset();
    config.set('baseEndPoint', 'https://test-api-endpoint.com');
    // set back to now as some test suites might update this
    jest.setSystemTime(now);
});
