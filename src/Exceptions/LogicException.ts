import BaseException from './BaseException';

/**
 * Error that occurs when trying to execute logic that is not supported.
 */
export default class LogicException extends BaseException {
    public get name(): string {
        return 'LogicException';
    }
}
