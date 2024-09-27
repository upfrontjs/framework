/* Utility types for transforming other types */
import type Model from '../Calliope/Model';

/**
 * Make the properties defined in the union required.
 */
export type RequireSome<T extends Record<PropertyKey, any>, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Make the properties defined in the union optional.
 */
export type PartialSome<T extends Record<PropertyKey, any>, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make the type either the initial value or an array of it.
 */
export type MaybeArray<T> = T | T[];

/**
 * Make the type either the initial value or a promise of it.
 */
export type MaybePromise<T> = Promise<T> | T;

/**
 * Set every property nested or otherwise to optional.
 */
export type DeepPartial<T> = T extends Record<PropertyKey, any>
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T;

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

/**
 * Hack to get the instance type of the given constructable.
 *
 * Derived from {@link https://github.com/Microsoft/TypeScript/issues/5863|this discussion}
 *
 * Declaring {@link https://www.typescriptlang.org/docs/handbook/2/functions.html#declaring-this-in-a-function|this}
 *
 * This can be used like:
 * @example
 * class Parent {
 *     public static newInstance<T extends StaticToThis>(this: T): T['prototype'] {
 *         return new this
 *     }
 * }
 * class Child extends Parent {}
 * const child = Child.newInstance(); // Will be the instance type of Child
 */
export type StaticToThis<T = Model> = {
    new(...args: any[]): T;
    prototype: T;
};

/**
 * Generic object data type.
 */
export type Data<T extends Record<string, any> = Record<string, any>> = T;
