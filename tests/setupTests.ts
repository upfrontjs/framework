import GlobalConfig from '../src/Support/GlobalConfig';
import type Configuration from '../src/Contracts/Configuration';
import { vi, beforeEach } from 'vitest';

/* eslint-disable-next-line @typescript-eslint/consistent-generic-constructors */
export const config: GlobalConfig<Configuration> = new GlobalConfig;

export const now = new Date(vi.getRealSystemTime());
vi.useFakeTimers({ now });
config.set('baseEndPoint', 'https://test-api-endpoint.com');

beforeEach(() => {
    config.reset();
    config.set('baseEndPoint', 'https://test-api-endpoint.com');
    // set back to now as some test suites might update this
    vi.setSystemTime(now);
});
