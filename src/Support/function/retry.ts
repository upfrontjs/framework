/**
 * Utility to re-run the given promise function until it resolves
 * or until the number of tries was exceeded.
 *
 * @param fn - The function returning a promise to be called.
 * @param {number} [maxRetries=3] - The number of times the function should be retried.
 * @param {number|function} [timeout=0] - The wait time between attempts in milliseconds.
 *                                        If 0, it will not wait.
 *                                        If a function, it will be called with the number of retries left.
 *
 * @example
 * // try up to four times with 2s delay between each try
 * const model = await retry(Model.find(1), 4, 2000);
 *
 * @return {Promise<any>}
 */
export default async function retry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    timeout: number | ((currentAttemptCount: number) => number) = 0
): Promise<T> {
    return new Promise((resolve, reject) => {
        let retries = 0;

        const attempt = () => {
            fn().then(resolve).catch(err => {
                if (retries++ < maxRetries) {
                    if (timeout) {
                        setTimeout(attempt, typeof timeout === 'function' ? timeout(retries) : timeout);
                    } else {
                        attempt();
                    }
                } else {
                    reject(err);
                }
            });
        };

        attempt();
    });
}
