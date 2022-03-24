export default abstract class BaseException extends Error {
    /**
     * The name of the called exception class.
     *
     * @type {string}
     */
    public abstract override get name(): string;
}
