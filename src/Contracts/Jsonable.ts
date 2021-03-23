export default interface Jsonable {
    /**
     * Convert object into JSON string.
     */
    toJson: () => string;
}
