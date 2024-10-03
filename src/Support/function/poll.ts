export default async function poll<T>(
    fn: () => Promise<T>,
    wait: number | ((result: T, attempts: number) => number) = 0,
    until?: Date | ((result: T, attempts: number) => boolean)
): Promise<T> {
    let attempts = 0;

    return new Promise((resolve, reject) => {
        const check = async () => {
            try {
                attempts++;
                const result = await fn();

                if (until && (until instanceof Date ? new Date() >= until : until(result, attempts))) {
                    resolve(result);
                    return;
                }

                setTimeout(() => void check(), typeof wait === 'function' ? wait(result, attempts) : wait);
            } catch (err: unknown) {
                // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                reject(err);
            }
        };

        void check();
    });
}
