import fetchMock from 'jest-fetch-mock';
import GlobalConfig from '../src/Support/GlobalConfig';
import type Configuration from '../src/Contracts/Configuration';

const config: GlobalConfig<Configuration> = new GlobalConfig;

fetchMock.enableMocks();
jest.useFakeTimers('modern');
const now = new Date(jest.getRealSystemTime());

global.beforeEach(() => {
    config.reset();
    config.set('baseEndPoint', 'https://test-api-endpoint.com');
    jest.setSystemTime(now);
});

export { config, now };
