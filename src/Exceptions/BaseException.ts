export default class BaseException extends Error {
    /**
     * The name of the called exception class.
     *
     * @type {string}
     */
    public get name(): string {
        return this.constructor.name;
    }
}
