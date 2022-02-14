import BaseException from './BaseException';

export default class InvalidOffsetException extends BaseException {
    public get name(): string {
        return 'InvalidOffsetException';
    }
}
