import fetchMock from 'jest-fetch-mock';
import GlobalConfig from '../src/Support/GlobalConfig';
import type Configuration from '../src/Contracts/Configuration';

/* eslint-disable-next-line @typescript-eslint/consistent-generic-constructors */
const config: GlobalConfig<Configuration> = new GlobalConfig;

/* eslint-disable jest/require-hook */
fetchMock.enableMocks();
jest.useFakeTimers('modern');
const now = new Date(jest.getRealSystemTime());
config.set('baseEndPoint', 'https://test-api-endpoint.com');
/* eslint-enable jest/require-hook */

// eslint-disable-next-line jest/require-top-level-describe
beforeEach(() => {
    config.reset();
    config.set('baseEndPoint', 'https://test-api-endpoint.com');
    jest.setSystemTime(now);
});

export { config, now };
