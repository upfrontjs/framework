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
