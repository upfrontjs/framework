import BaseException from './BaseException';

/**
 * Error that occurs when providing an unexpected argument to a function.
 */
export default class InvalidArgumentException extends BaseException {
    public get name(): string {
        return 'InvalidArgumentException';
    }
}
