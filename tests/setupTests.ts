import '../Illuminate/Support/string';
import '../Illuminate/Support/array';
import '../Illuminate/Support/function';
import fetchMock from 'jest-fetch-mock';
import Config from '../Illuminate/Support/Config';

new Config().set('baseEndPoint', 'https://test-api-endpoint.com/');

fetchMock.enableMocks();
