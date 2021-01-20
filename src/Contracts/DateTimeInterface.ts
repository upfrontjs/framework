export default interface DateTimeInterface {
    /**
     * Parse the given value.
     *
     * @param {...any} value
     */
    parse: (...value: any[]) => DateTimeInterface;

    /**
     * The string representation of the date time if treated as string.
     *
     * @return {string}
     */
    toString: () => string;
}
