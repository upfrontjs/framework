export default interface Arrayable<T> {
    /**
     * Get the instance as an array.
     *
     * @return array
     */
    toArray: () => T[];
}
