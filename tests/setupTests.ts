import '../src/Support/string';
import '../src/Support/array';
import '../src/Support/function';
import fetchMock from 'jest-fetch-mock';
import Config from '../src/Support/Config';

const config = new Config();

fetchMock.enableMocks();

declare global {
    interface Array<T> {
        has(value: T): boolean;
    }
}

Object.defineProperty(Array.prototype, 'has', {
    value: function (value: any) {
        return this.indexOf(value) !== -1;
    }
});

global.beforeEach(() => {
    config.reset();
    config.set('baseEndPoint', 'https://test-api-endpoint.com');
});
