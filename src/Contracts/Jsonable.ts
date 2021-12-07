export default interface Jsonable {
    /**
     * Convert object into JSON.
     */
    // https://github.com/microsoft/TypeScript/issues/1897
    toJSON: () => ReturnType<typeof JSON.parse>;
}
