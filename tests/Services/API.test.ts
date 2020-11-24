import API from '../../src/Services/API';
import Config from '../../src/Support/Config';

const config = new Config();
const url = String(config.get('baseEndPoint')).finish('/') + 'users';

class APITester extends API {
    public getConfig(
        url: string,
        method: 'get'|'post'|'delete'|'patch'|'put',
        data?: Record<string, any>,
        customHeaders?: Record<string, string|string[]>
    ): { url: string; requestInit: RequestInit } {
        return this.initConfig(url, method, data, customHeaders);
    }
}

let api: APITester;

describe('api', () => {
    beforeEach(() => {
        api = new APITester();
    });

    describe('initConfig()', () => {
        it('can encode get parameters', () => {
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

            // @ts-expect-error
            expect(config.requestInit.headers.get('Content-Type'))
                .toBe('application/x-www-form-urlencoded; charset=utf-8');
        });

        it('can merge in config into the RequestInit from requestOptions', () => {
            Object.defineProperty(api, 'requestOptions', {
                value: {
                    body: 'merged value'
                }
            });

            const config = api.getConfig(url, 'post').requestInit;

            expect(config.body).toBe('merged value');
        });

        it('overrides requestOptions.body if data is given', () => {
            Object.defineProperty(api, 'requestOptions', {
                value: {
                    body: 'merged value'
                }
            });

            const config = api.getConfig(url, 'post', { someAttribute: 'original value' }).requestInit;

            expect(config.body).toStrictEqual(JSON.stringify({ someAttribute: 'original value' }));
        });

        it('merges the initRequest method return value if defined', () => {
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

        it('can parse out the headers if previously merged in', () => {
            Object.defineProperty(api, 'requestOptions', {
                value: {
                    headers: { custom: ['header'] }
                }
            });

            const config = api.getConfig(url, 'post').requestInit;

            // @ts-expect-error
            expect(config.headers.has('custom')).toBe(true);
        });

        it('removes the merged in body if it is a get method', () => {
            Object.defineProperty(api, 'requestOptions', {
                value: {
                    body: 'value'
                }
            });

            const config = api.getConfig(url, 'get').requestInit;

            expect(config.body).toBeUndefined();
        });

        it('can prepare FormData', () => {
            const form = new FormData();
            form.append('key', 'value');

            const config = api.getConfig(url, 'post', form).requestInit;

            expect(config.body).toBeInstanceOf(FormData);
            // @ts-expect-error
            expect(config.headers.get('Content-Type')).toBe('multipart/form-data');
        });

        it('stringifies the given data', () => {
            const data = { custom: 'value' };
            const config = api.getConfig(url, 'post', data).requestInit;

            expect(config.body).toBe(JSON.stringify(data));
            // @ts-expect-error
            expect(config.headers.get('Content-Type')).toBe('application/json; charset=UTF-8');
        });

        it('processes the given custom headers', () => {
            const header: Record<string, string|string[]> = { custom: 'header' };
            const config = api.getConfig(url, 'post', undefined, header).requestInit;

            // @ts-expect-error
            expect(config.headers.get('custom')).toBe('header');

            header.custom = ['multiple', 'values'];

            const newConfig = api.getConfig(url, 'post', undefined, header).requestInit;

            // @ts-expect-error
            expect(newConfig.headers.get('custom')).toBe(header.custom.join(', '));
        });
    });

    describe('call()', () => {
        it('returns a promise', () => {
            expect(api.call(url, 'get')).toBeInstanceOf(Promise);
        });
    });
});
