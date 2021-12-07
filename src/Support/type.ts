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
 * Set every property nested or otherwise to optional.
 */
export type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]> | T[P];
};

/**
 * Get the keys of the given type where the value matches the given argument.
 */
export type KeysMatching<T, V> = { [K in keyof T]: T[K] extends never ? V : K }[keyof T];

/**
 * Get the keys of the given type where the value doesn't match the given argument.
 */
export type KeysNotMatching<T, V> = { [K in keyof T]: T[K] extends V ? never : K }[keyof T];

/**
 * Make an intersection type from the given object type or interface union.
 */
export type UnionToIntersection<T extends Record<PropertyKey, any>> = (T extends any ? (x: T) => any : never) extends (
    x: infer U
) => any ? U : never;
