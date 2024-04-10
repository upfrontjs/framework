import value from './value';
import type { MaybeArray } from '../type';

/**
 * Utility to re-run the given promise function until it resolves
 * or until the number of tries was exceeded.
 *
 * @param fn - The function returning a promise to be called.
 * @param {number} [maxRetries=3] - The number of times the function should be retried.
 *                                  If an array is given, it will be used as the wait time between each try.
 * @param {number|function} [timeout=0] - The wait time between attempts in milliseconds.
 *                                        If 0, it will not wait.
 *                                        If a function, it will be called with the number of retries left.
 * @param {function} [errorCheck] - A function returning a boolean depending on if error should be retried.
 *
 * @example
 * // try up to four times with 2s delay between each try
 * const model = await retry(Model.find(1), 4, 2000);
 *
 * @return {Promise<any>}
 */

export default async function retry<T>(
    fn: () => Promise<T>,
    maxRetries: number[],
    timeout?: undefined,
    errorCheck?: (err: unknown) => boolean
): Promise<T>;
export default async function retry<T>(
    fn: () => Promise<T>,
    maxRetries?: number,
    timeout?: number | ((currentAttemptCount: number) => number),
    errorCheck?: (err: unknown) => boolean
): Promise<T>;
export default async function retry<T>(
    fn: () => Promise<T>,
    maxRetries: MaybeArray<number> = 3,
    timeout: number | ((currentAttemptCount: number) => number) = 0,
    errorCheck?: (err: unknown) => boolean
): Promise<T> {
    return new Promise((resolve, reject) => {
        let retries = 0;

        const attempt = () => {
            fn().then(resolve).catch((err: unknown) => {
                if (errorCheck && !errorCheck(err)) {
                    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                    reject(err);
                }

                const timeOutValue = Array.isArray(maxRetries) ? maxRetries[retries]! : timeout;

                if (retries++ < (Array.isArray(maxRetries) ? maxRetries.length : maxRetries)) {
                    if (timeOutValue) {
                        setTimeout(attempt, value(timeOutValue, retries));
                    } else {
                        attempt();
                    }
                } else {
                    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                    reject(err);
                }
            });
        };

        attempt();
    });
}
