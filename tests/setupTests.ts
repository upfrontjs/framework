import 'jest-date-mock';
import fetchMock from 'jest-fetch-mock';
import GlobalConfig from '../src/Support/GlobalConfig';
import type Configuration from '../src/Contracts/Configuration';

const config: GlobalConfig<Configuration> = new GlobalConfig;

fetchMock.enableMocks();

global.beforeEach(() => {
    config.reset();
    config.set('baseEndPoint', 'https://test-api-endpoint.com');
});

export { config };
