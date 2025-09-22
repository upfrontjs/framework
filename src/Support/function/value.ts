export default function value<T>(val: T, ...args: any[]): T extends (...args: any[]) => infer R ? R : T {
    return typeof val === 'function' ? val(...args) : val as any;
}
