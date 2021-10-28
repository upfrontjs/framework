import fetchMock from 'jest-fetch-mock';
import GlobalConfig from '../src/Support/GlobalConfig';
import type Configuration from '../src/Contracts/Configuration';

const config: GlobalConfig<Configuration> = new GlobalConfig;

// eslint-disable-next-line jest/require-hook
fetchMock.enableMocks();
jest.useFakeTimers('modern');
const now = new Date(jest.getRealSystemTime());

// eslint-disable-next-line jest/require-top-level-describe
beforeEach(() => {
    config.reset();
    config.set('baseEndPoint', 'https://test-api-endpoint.com');
    jest.setSystemTime(now);
});

export { config, now };
