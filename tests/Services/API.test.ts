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
            const urlWithParams = api.getConfig(url, 'get', {
                nested: {
                    objects: [
                        { id: 1 },
                        { id: 2 }
                    ]
                },
                array: [1, 2]
            })
                .url;

            expect(urlWithParams).toBe(
                url
                + '?'
                + 'nested[objects][][id]=1&nested[objects][][id]=2&array[]=1&array[]=2'
            );
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
    });
});
