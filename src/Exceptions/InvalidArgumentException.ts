import BaseException from './BaseException';

export default class InvalidArgumentException extends BaseException {
    public get name(): string {
        return 'InvalidArgumentException';
    }
}
