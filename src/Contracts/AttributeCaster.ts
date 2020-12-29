export default interface AttributeCaster {
    /**
     * Transform the attribute from the underlying model value.
     *
     * @param {string} key
     * @param {any} value
     *
     * @return {any}
     */
    get(key: string, value: unknown): unknown;

    /**
     * Transform the attribute to its underlying model values.
     *
     * @param {string} key
     * @param {any} value
     *
     * @return {void}
     */
    set(key: string, value: unknown): void;
}
