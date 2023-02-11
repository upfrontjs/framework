export default function value<T>(val: T, ...args: any[]): T extends (...args: any[]) => infer R ? R : T {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return typeof val === 'function' ? val(...args) : val;
}
