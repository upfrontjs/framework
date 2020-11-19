import '../src/Support/string';
import '../src/Support/array';
import '../src/Support/function';
import fetchMock from 'jest-fetch-mock';
import Config from '../src/Support/Config';

new Config().set('baseEndPoint', 'https://test-api-endpoint.com/');

fetchMock.enableMocks();
