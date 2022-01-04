import { cloneDeep, merge } from 'lodash';
import type Configuration from '../Contracts/Configuration';

type WithProperty<T, K extends PropertyKey> = T & {
    [P in K]: Exclude<P extends keyof T ? T[P] : unknown, undefined>
};

export default class GlobalConfig<T extends Configuration & Record<PropertyKey, any>> {
    /**
     * The configuration object.
     *
     * @protected
     */
    protected static configuration: Configuration & Record<PropertyKey, any> = {};

    /**
     * Keys marked for not be deeply cloned when setting and returning values.
     */
    public static usedAsReference: (PropertyKey | keyof Configuration)[] = ['headers'];

    /**
     * The config constructor.
     *
     * @param {object} configuration
     */
    public constructor(configuration?: T) {
        if (configuration) {
            merge(GlobalConfig.configuration, configuration);
        }
    }

    /**
     * Get a value from the config.
     *
     * @param {string} key
     * @param {any=}   defaultVal
     */
    public get<K extends keyof T>(key: K, defaultVal?: T[K]): T[K];
    public get<D>(key: PropertyKey, defaultVal?: D): D;
    public get<D>(key: PropertyKey, defaultVal?: D): D {
        if (!this.has(key)) {
            return defaultVal!;
        }

        const value = GlobalConfig.configuration[key as string];

        if (GlobalConfig.usedAsReference.includes(key) || GlobalConfig.usedAsReference.includes('*')) {
            return value;
        }

        return typeof value === 'function' ? value : cloneDeep(value);
    }

    /**
     * Determine whether a key is set in the config or not.
     *
     * @param {string} key
     */
    public has<K extends PropertyKey | keyof T>(key: K): this is GlobalConfig<WithProperty<T, K>> {
        return GlobalConfig.configuration.hasOwnProperty(key);
    }

    /**
     * Set a config value.
     *
     * @param {string} key
     * @param {any}    value
     */
    public set<K extends keyof T>(key: K, value: T[K]): asserts this is GlobalConfig<WithProperty<T, K>>;
    public set<K extends PropertyKey, V>(key: K, value: V): asserts this is GlobalConfig<T & { [key in K]: V }>;
    public set(key: string, value: unknown): void {
        if (GlobalConfig.usedAsReference.includes(key) || GlobalConfig.usedAsReference.includes('*')) {
            GlobalConfig.configuration[key] = value;

            return;
        }

        GlobalConfig.configuration[key] = typeof value === 'function' ? value : cloneDeep(value);
    }

    /**
     * Remove a config value.
     *
     * @param {string} key
     */
    public unset<K extends PropertyKey | keyof T>(key: K): asserts this is GlobalConfig<Omit<T, K>> {
        delete GlobalConfig.configuration[key];
    }

    /**
     * Empty the configuration.
     *
     * @return {this}
     */
    public reset(): asserts this is GlobalConfig<Partial<T>> {
        GlobalConfig.configuration = {};
    }
}
