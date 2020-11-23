import API from '../../src/Services/API';
import type ApiCaller from '../../src/Contracts/ApiCaller';
import Config from '../../src/Support/Config';

const config = new Config();
const url = String(config.get('baseEndPoint')).finish('/') + 'users';

let api: ApiCaller;

describe('api', () => {
    beforeEach(() => {
        api = new API();
    });

    it('can encode get parameters', () => {
        // @ts-expect-error
        const urlWithParams = api.initConfig(url, 'get', {
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
});
