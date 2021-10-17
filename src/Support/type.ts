/* Utility types for transforming other types */

/**
 * Make the properties defined in the union required.
 */
export type RequireSome<T extends Record<PropertyKey, any>, K extends keyof T> = Omit<T, K> & {
    [MK in K]-?: NonNullable<T[MK]>
};

/**
 * Make the type either the initial value or an array of it.
 */
export type MaybeArray<T> = T | T[];

/**
 * Get the type of the arguments for the given callable type into a tuple.
 */
export type ExtractArguments<T> = [T] extends [(...args: infer U) => any]
    ? U
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    : [T] extends [void] ? [] : [T];

/**
 * Set every property nested or otherwise to optional.
 */
export type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]> | T[P];
};
