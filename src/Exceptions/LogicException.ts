import BaseException from './BaseException';

export default class LogicException extends BaseException {
    public get name(): string {
        return 'LogicException';
    }
}
