import BaseException from './BaseException';

/**
 * Error that occurs when accessing an unexpected property on a structure.
 */
export default class InvalidOffsetException extends BaseException {
    public get name(): string {
        return 'InvalidOffsetException';
    }
}
