import '../src/Support/string';
import '../src/Support/array';
import '../src/Support/function';
import fetchMock from 'jest-fetch-mock';
import Config from '../src/Support/Config';

new Config().set('baseEndPoint', 'https://test-api-endpoint.com/');

fetchMock.enableMocks();

declare global {
    interface Array<T> {
        has(o: T): boolean;
    }
}

Object.defineProperty(Array.prototype, 'has', {
    value: function (value: any) {
        return this.indexOf(value) !== -1;
    }
});
