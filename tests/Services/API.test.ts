import API from '../../src/Services/API';
import { config as globalConfig } from '../setupTests';
import type { CustomHeaders, Method } from '../../src/Calliope/Concerns/CallsApi';
import { finish } from '../../src/Support/string';
import InvalidArgumentException from '../../src/Exceptions/InvalidArgumentException';
import fetchMock from '../mock/fetch-mock';
import { beforeEach, describe, expect, it } from 'vitest';

const url = finish(String(globalConfig.get('baseEndPoint')), '/') + 'users';

class APITester extends API {
    public async getConfig(
        endpoint: string,
        method: Method,
        data?: FormData | Record<string, unknown>,
        customHeaders?: CustomHeaders
    ): Promise<{ url: string; requestInit: RequestInit }> {
        return this.initConfig(endpoint, method, data, customHeaders);
    }
}

let api: APITester;

describe('API', () => {
    beforeEach(() => {
        api = new APITester();
    });

    describe('initConfig()', () => {
        it('should encode get parameters correctly', async () => {
            const config = await api.getConfig(url, 'get', {
                nested: {
                    objects: [
                        { id: 1 },
                        { id: 2 }
                    ]
                },
                array: [1, 2]
            });

            expect(config.url).toBe(
                url
                + '?'
                + 'nested[objects][0][id]=1&nested[objects][1][id]=2&array[0]=1&array[1]=2'
            );
        });

        it('should merge in config into the RequestInit from requestOptions', async () => {
            Object.defineProperty(api, 'requestOptions', {
                value: {
                    body: 'merged value'
                }
            });

            const config = (await api.getConfig(url, 'post')).requestInit;

            expect(config.body).toBe('merged value');
        });

        it('should override requestOptions.body if data is given', async () => {
            Object.defineProperty(api, 'requestOptions', {
                value: {
                    body: 'merged value'
                }
            });

            const config = (await api.getConfig(url, 'post', { someAttribute: 'original value' })).requestInit;

            expect(config.body).toStrictEqual(JSON.stringify({ someAttribute: 'original value' }));
        });

        it('should merge the initRequest method return value if defined', async () => {
            Object.defineProperty(api, 'initRequest', {
                value: {
                    body: 'merged value'
                },
                writable: true
            });

            let config = (await api.getConfig(url, 'post')).requestInit;

            // only merge in if initRequest is a function, and it returns an object
            expect(config.body).toBeUndefined();

            api.initRequest = () => ({ body: 'merged value' });

            config = (await api.getConfig(url, 'post')).requestInit;

            expect(config.body).toBe('merged value');
        });

        it('should merge the initRequest method return value if defined as async', async () => {
            api.initRequest = async () => Promise.resolve({ body: 'merged value' });

            const config = (await api.getConfig(url, 'post')).requestInit;

            expect(config.body).toBe('merged value');
        });

        it('should parse out the headers if previously merged in', async () => {
            Object.defineProperty(api, 'requestOptions', {
                value: {
                    headers: { custom: ['header'] }
                }
            });

            const config = (await api.getConfig(url, 'post')).requestInit;

            // @ts-expect-error
            expect(config.headers.has('custom')).toBe(true);
        });

        it('should remove the merged in body if it is a get method', async () => {
            Object.defineProperty(api, 'requestOptions', {
                value: {
                    body: 'value'
                }
            });

            const config = (await api.getConfig(url, 'get')).requestInit;

            expect(config.body).toBeUndefined();
        });

        it('should stringify the given data', async () => {
            const data = { custom: 'value' };
            const config = (await api.getConfig(url, 'post', data)).requestInit;

            expect(config.body).toBe(JSON.stringify(data));
            // @ts-expect-error
            expect(config.headers.get('Content-Type')).toBe('application/json; charset="utf-8"');
        });

        it('should process the given custom headers', async () => {
            const header: CustomHeaders = { custom: 'header' };
            const config = (await api.getConfig(url, 'post', undefined, header)).requestInit;

            // @ts-expect-error
            expect(config.headers.get('custom')).toBe('header');

            header.custom = ['multiple', 'values'];

            const newConfig = (await api.getConfig(url, 'post', undefined, header)).requestInit;

            // @ts-expect-error
            expect(newConfig.headers.get('custom')).toBe(header.custom.join(', '));
        });

        it('should throw an error for value not of string type', async () => {
            const header: Record<string, null[] | null> = { custom: null };
            // @ts-expect-error
            await expect(async () => api.getConfig(url, 'post', undefined, header))
                .rejects
                .toThrow(new InvalidArgumentException('For \'custom\' expected type string, got: object'));
        });

        it('should merge in headers from the config if set', async () => {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            globalConfig.set('headers', { 'custom-header': 'value' });

            const initConfig = (await api.getConfig(url, 'post')).requestInit;

            // @ts-expect-error
            expect(initConfig.headers.has('custom-header')).toBe(true);

            // @ts-expect-error
            expect(initConfig.headers.get('custom-header')).toBe('value');

            globalConfig.unset('headers');
        });

        it('should set the Accept header if not already set', async () => {
            /* eslint-disable @typescript-eslint/naming-convention */
            let config = (await api.getConfig(url, 'post', {})).requestInit;

            // @ts-expect-error
            expect(config.headers.get('Accept')).toBe('application/json');

            config = (await api.getConfig(url, 'post', {}, { 'Accept': 'myArgumentValue' })).requestInit;
            // @ts-expect-error
            expect(config.headers.get('Accept')).toBe('myArgumentValue');

            globalConfig.set('headers', { 'Accept': 'myGlobalValue' });
            config = (await api.getConfig(url, 'post', {})).requestInit;
            // @ts-expect-error
            expect(config.headers.get('Accept')).toBe('myGlobalValue');
            globalConfig.unset('headers');

            Object.defineProperty(api, 'requestOptions', {
                value: {
                    headers: { Accept: 'myRequestOptionValue' }
                } as Partial<RequestInit>,
                configurable: true
            });
            config = (await api.getConfig(url, 'post', {})).requestInit;
            // @ts-expect-error
            expect(config.headers.get('Accept')).toBe('myRequestOptionValue');
            delete api.requestOptions;

            Object.defineProperty(api, 'initRequest', {
                value: (
                    /* eslint-disable @typescript-eslint/no-unused-vars */
                    _url: string,
                    _method: 'delete' | 'get' | 'patch' | 'post' | 'put',
                    _data?: FormData | Record<string, unknown>
                    /* eslint-enable @typescript-eslint/no-unused-vars */
                ): Partial<RequestInit> => {
                    return {
                        headers: { Accept: 'myInitRequestValue' }
                    };
                },
                configurable: true
            });
            config = (await api.getConfig(url, 'post', {})).requestInit;
            // @ts-expect-error
            expect(config.headers.get('Accept')).toBe('myInitRequestValue');
            delete api.initRequest;

            /* eslint-enable @typescript-eslint/naming-convention */
        });

        it('should set the method to GET if it got removed', async () => {
            Object.defineProperty(api, 'requestOptions', {
                value: {},
                configurable: true
            });
            let config = (await api.getConfig(url, 'get', {})).requestInit;

            expect(config.method).toBe('GET');
            delete api.requestOptions;

            Object.defineProperty(api, 'initRequest', {
                value: (
                    /* eslint-disable @typescript-eslint/no-unused-vars */
                    _url: string,
                    _method: 'delete' | 'get' | 'patch' | 'post' | 'put',
                    _data?: FormData | Record<string, unknown>
                    /* eslint-enable @typescript-eslint/no-unused-vars */
                ): Partial<RequestInit> => {
                    // @ts-expect-error we want to unset for this test
                    return {
                        method: undefined
                    };
                },
                configurable: true
            });
            config = (await api.getConfig(url, 'post', {})).requestInit;
            expect(config.method).toBe('GET');
            delete api.initRequest;
        });
    });

    describe('call()', () => {
        it('should return a promise', () => {
            fetchMock.mockResponseOnce('value');
            expect(api.call(url, 'GET')).toBeInstanceOf(Promise);
        });
    });
});
