# Testing

Upfront is fully tested to give as much confidence in the code as possible. To carry on this ethos in your application, upfront offers helpful tools for testing with mock data and test outgoing requests.

## Testing service implementations
Swapping out [services](../services/readme.md) of upfront is easy as setting them in the [GlobalConfig](../helpers/global-config.md).
For example if you want to test your custom method you added to a model, you could do something similar to the following:

<CodeGroup>

<CodeGroupItem title="Javascript">

```js
import { GlobalConfig } from '@upfrontjs/framework';
import User from '@/Models'

const config = new GlobalConfig;

describe('customAjaxMethod()', () => {
    const mockFunc = vi.fn();
    const user = new User;
    config.set('api', {
        handle: mockFunc
    });
    
    it('should initiate a GET request', async () => {
        await user.customAjaxRequest();
        
        expect(mockFunc).toHaveBeenCalledWith('url', 'get', 'data', 'customHeaders')
    });
});
```
</CodeGroupItem>

<CodeGroupItem title="Typescript">

```ts
import { GlobalConfig } from '@upfrontjs/framework';
import type { Configuration } from '@upfrontjs/framework';
import type MyConfig from '@/MyConfig';
import User from '@/Models/User'

const config: GlobalConfig<MyConfig extends Configuration> = new GlobalConfig;

describe('customAjaxMethod()', () => {
    const mockFunc = vi.fn();
    const user = new User;
    config.set('api', {
        handle: mockFunc
    });
    
    it('should initiate a GET request', async () => {
        await user.customAjaxRequest();
        
        expect(mockFunc).toHaveBeenCalledWith('url', 'get', 'data', 'customHeaders')
    });
});
```

</CodeGroupItem>

</CodeGroup>
