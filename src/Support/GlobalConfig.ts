import { cloneDeep, merge } from 'lodash';
import type Configuration from '../Contracts/Configuration';

type WithProperty<T, K extends PropertyKey> = T & {
    [P in K]: Exclude<P extends keyof T ? T[P] : unknown, undefined>
};

export default class GlobalConfig<T extends Configuration> {
    /**
     * The configuration object.
     *
     * @protected
     */
    protected static configuration: Configuration = {};

    /**
     * Keys marked for not be deeply cloned when setting and returning.
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
    public get<D>(key: string, defaultVal?: D): D {
        if (!this.has(key)) {
            return defaultVal!;
        }

        const value = GlobalConfig.configuration[key];

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
    public has<K extends string | keyof Configuration>(key: K): this is GlobalConfig<WithProperty<T, K>> {
        return GlobalConfig.configuration.hasOwnProperty(key);
    }

    /**
     * Set a config value.
     *
     * @param {string} key
     * @param {any}    value
     */
    public set<K extends string | keyof Configuration>(
        key: K,
        value: T[K]
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
    public unset<K extends string | keyof Configuration>(key: K): asserts this is GlobalConfig<Omit<T, K>> {
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
