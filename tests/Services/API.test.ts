import API from '../../src/Services/API';
import { config as globalConfig } from '../setupTests';
import { finish } from '../../src';
import InvalidArgumentException from '../../src/Exceptions/InvalidArgumentException';

const url = finish(String(globalConfig.get('baseEndPoint')), '/') + 'users';

class APITester extends API {
    public getConfig(
        endpoint: string,
        method: 'delete' | 'get' | 'patch' | 'post' | 'put',
        data?: FormData | Record<string, unknown>,
        customHeaders?: Record<string, string[] | string>
    ): { url: string; requestInit: RequestInit } {
        return this.initConfig(endpoint, method, data, customHeaders);
    }
}

let api: APITester;

describe('API', () => {
    beforeEach(() => {
        api = new APITester();
    });

    describe('initConfig()', () => {
        it('should encode get parameters correctly', () => {
            const config = api.getConfig(url, 'get', {
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
                + 'nested[objects][][id]=1&nested[objects][][id]=2&array[]=1&array[]=2'
            );
        });

        it('should merge in config into the RequestInit from requestOptions', () => {
            Object.defineProperty(api, 'requestOptions', {
                value: {
                    body: 'merged value'
                }
            });

            const config = api.getConfig(url, 'post').requestInit;

            expect(config.body).toBe('merged value');
        });

        it('should override requestOptions.body if data is given', () => {
            Object.defineProperty(api, 'requestOptions', {
                value: {
                    body: 'merged value'
                }
            });

            const config = api.getConfig(url, 'post', { someAttribute: 'original value' }).requestInit;

            expect(config.body).toStrictEqual(JSON.stringify({ someAttribute: 'original value' }));
        });

        it('should merge the initRequest method return value if defined', () => {
            Object.defineProperty(api, 'initRequest', {
                value: {
                    body: 'merged value'
                },
                writable: true
            });

            let config = api.getConfig(url, 'post').requestInit;

            expect(config.body).toBeUndefined();

            api.initRequest = () => ({ body: 'merged value' });

            config = api.getConfig(url, 'post').requestInit;

            // only merge if initRequest it is a function and it returns an object
            expect(config.body).toBe('merged value');
        });

        it('should parse out the headers if previously merged in', () => {
            Object.defineProperty(api, 'requestOptions', {
                value: {
                    headers: { custom: ['header'] }
                }
            });

            const config = api.getConfig(url, 'post').requestInit;

            // @ts-expect-error
            expect(config.headers.has('custom')).toBe(true);
        });

        it('should remove the merged in body if it is a get method', () => {
            Object.defineProperty(api, 'requestOptions', {
                value: {
                    body: 'value'
                }
            });

            const config = api.getConfig(url, 'get').requestInit;

            expect(config.body).toBeUndefined();
        });

        it('should prepare FormData', () => {
            const form = new FormData();
            form.append('key', 'value');

            const config = api.getConfig(url, 'post', form).requestInit;

            expect(config.body).toBeInstanceOf(FormData);
            expect((config.body as FormData).get('key')).toBe('value');
            // @ts-expect-error
            expect(config.headers.get('Content-Type')).toBe('multipart/form-data');
        });

        it('should stringify the given data', () => {
            const data = { custom: 'value' };
            const config = api.getConfig(url, 'post', data).requestInit;

            expect(config.body).toBe(JSON.stringify(data));
            // @ts-expect-error
            expect(config.headers.get('Content-Type')).toBe('application/json; charset="utf-8"');
        });

        it('should process the given custom headers', () => {
            const header: Record<string, string[] | string> = { custom: 'header' };
            const config = api.getConfig(url, 'post', undefined, header).requestInit;

            // @ts-expect-error
            expect(config.headers.get('custom')).toBe('header');

            header.custom = ['multiple', 'values'];

            const newConfig = api.getConfig(url, 'post', undefined, header).requestInit;

            // @ts-expect-error
            expect(newConfig.headers.get('custom')).toBe(header.custom.join(', '));
        });

        it('should throw an error for value not of string type', () => {
            const header: Record<string, null[] | null> = { custom: null };
            // @ts-expect-error
            expect(() => api.getConfig(url, 'post', undefined, header))
                .toThrow(new InvalidArgumentException('For \'custom\' expected type string, got: object'));
        });

        it('should merge in headers from the config if set', () => {
            globalConfig.set('headers', { 'custom-header': 'value' });

            const initConfig = api.getConfig(url, 'post').requestInit;

            // @ts-expect-error
            expect(initConfig.headers.has('custom-header')).toBe(true);

            // @ts-expect-error
            expect(initConfig.headers.get('custom-header')).toBe('value');

            globalConfig.unset('headers');
        });

        it('should set the Accept header if not already set', () => {
            /* eslint-disable @typescript-eslint/naming-convention */
            let config = api.getConfig(url, 'post', {}).requestInit;

            // @ts-expect-error
            expect(config.headers.get('Accept')).toBe('application/json');

            config = api.getConfig(url, 'post', {}, { 'Accept': 'myArgumentValue' }).requestInit;
            // @ts-expect-error
            expect(config.headers.get('Accept')).toBe('myArgumentValue');

            globalConfig.set('headers', { 'Accept': 'myGlobalValue' });
            config = api.getConfig(url, 'post', {}).requestInit;
            // @ts-expect-error
            expect(config.headers.get('Accept')).toBe('myGlobalValue');
            globalConfig.unset('headers');

            Object.defineProperty(api, 'requestOptions', {
                value: {
                    headers: { Accept: 'myRequestOptionValue' }
                } as Partial<RequestInit>,
                configurable: true
            });
            config = api.getConfig(url, 'post', {}).requestInit;
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
            config = api.getConfig(url, 'post', {}).requestInit;
            // @ts-expect-error
            expect(config.headers.get('Accept')).toBe('myInitRequestValue');
            delete api.initRequest;

            /* eslint-enable @typescript-eslint/naming-convention */
        });

        it('should set the method to GET if it got removed', () => {
            Object.defineProperty(api, 'requestOptions', {
                value: {
                    method: undefined
                } as Partial<RequestInit>,
                configurable: true
            });
            let config = api.getConfig(url, 'get', {}).requestInit;

            expect(config.method).toBe('get');
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
                        method: undefined
                    };
                },
                configurable: true
            });
            config = api.getConfig(url, 'post', {}).requestInit;
            expect(config.method).toBe('get');
            delete api.initRequest;
        });
    });

    describe('call()', () => {
        it('should return a promise', () => {
            expect(api.call(url, 'get')).toBeInstanceOf(Promise);
        });
    });
});
