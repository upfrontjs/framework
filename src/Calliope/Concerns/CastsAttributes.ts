import LogicException from '../../Exceptions/LogicException';
import Collection from '../../Support/Collection';
import { cloneDeep, merge } from 'lodash';
import type AttributeCaster from '../../Contracts/AttributeCaster';
import GlobalConfig from '../../Support/GlobalConfig';
import type { Attributes } from './HasAttributes';
import InvalidArgumentException from '../../Exceptions/InvalidArgumentException';
import { isConstructableUserClass, isObjectLiteral } from '../../Support/function';
import type Model from '../Model';

type BuiltInCastType = 'boolean' | 'collection' | 'datetime' | 'number' | 'string';
export type CastType = AttributeCaster | BuiltInCastType;

export default class CastsAttributes {
    /**
     * The attributes that should be cast.
     *
     * @protected
     *
     * @type {object}
     */
    protected attributeCasts: Record<string, CastType> = this.casts;

    /**
     * The attributes that should be cast.
     *
     * @protected
     *
     * @type {object}
     */
    public get casts(): Record<string, CastType> {
        return {};
    }

    /**
     * Merge new casts with existing casts on the model.
     *
     * @param {object} casts
     *
     * @return {this}
     */
    public mergeCasts(casts: Record<string, CastType>): this {
        this.attributeCasts = merge(this.attributeCasts, casts);

        return this;
    }

    /**
     * Set the casts for the model.
     *
     * @param {object} casts
     *
     * @return {this}
     */
    public setCasts(casts: Record<string, CastType>): this {
        this.attributeCasts = casts;

        return this;
    }

    /**
     * Determine whether an attribute should be cast to a determined type.
     *
     * @param {string} key
     *
     * @return {boolean}
     */
    public hasCast(key: string): key is BuiltInCastType | 'object' {
        const cast = this.getCastType(key);

        if (!cast) return false;

        return ['boolean', 'datetime', 'number', 'collection', 'object', 'string'].includes(cast);
    }

    /**
     * Get the type of cast for a model attribute.
     *
     * @param {string} key
     *
     * @protected
     *
     * @return {string|undefined}
     */
    protected getCastType(key: string): BuiltInCastType | 'object' | undefined {
        const caster = this.attributeCasts[key];

        if (!caster) {
            return undefined;
        }

        if (this.implementsCaster(caster)) {
            return 'object';
        }

        return caster;
    }

    /**
     * Cast the attribute to the specified type.
     *
     * @param {string} key
     * @param {any} value
     * @param {object} attributes
     * @param {string} method - The method to use when interacting with the AttributeCaster.
     *
     * @protected
     *
     * @return {any}
     */
    protected castAttribute(
        key: string,
        value: any,
        attributes?: Attributes,
        method: keyof AttributeCaster = 'get'
    ): unknown {
        value = cloneDeep(value);

        if (!this.hasCast(key)) {
            return value;
        }

        switch (this.getCastType(key)) {
            case 'boolean':
                return this.castToBoolean(key, value);
            case 'string':
                return this.castToString(key, value);
            case 'number':
                return this.castToNumber(key, value);
            case 'object':
                return this.castWithObject(
                    key,
                    value,
                    attributes ?? (this as unknown as Model).getRawAttributes(),
                    method
                );
            case 'collection':
                if (method === 'set') {
                    if (Collection.isCollection(value)) {
                        // we don't want to wrap collection in a collection on every get
                        return value.toArray();
                    }

                    return value;
                } else {
                    return new Collection(value);
                }
            case 'datetime':
                if (method === 'set') {
                    // check if it throws
                    this.getDateTimeLibInstance(value);
                    return value;
                } else {
                    return this.castToDateTime(key, value);
                }
            default:
                // either or both hasCast() and getCastType() has been overridden and hasCast()
                // returns true while getCastType() returns a value that lands in this default case
                throw new LogicException(
                    'Impossible logic path reached. getCastType() returned unexpected value.'
                );
        }
    }

    /**
     * Determine whether the given value implements casting.
     *
     * @param {any} value
     *
     * @protected
     *
     * @return {boolean}
     */
    protected implementsCaster(value: any): value is AttributeCaster {
        if (!isObjectLiteral(value)) {
            return false;
        }

        return 'set' in value
            && value.set instanceof Function
            && 'get' in value
            && value.get instanceof Function;
    }

    /**
     * Get the date time library from the config, throw error if library is invalid.
     *
     * @param {any} value
     *
     * @protected
     */
    protected getDateTimeLibInstance(value: unknown): unknown {
        const dateTimeLib = new GlobalConfig().get('datetime', Date);

        if (!dateTimeLib || !(dateTimeLib instanceof Function)) { // class and function are both of type Function
            throw new InvalidArgumentException(
                '\'datetime\' is not of expected type or has not been set in the ' + GlobalConfig.name + '.'
            );
        }

        if (Object.is(Date, dateTimeLib)) {
            return new Date(value as number | string);
        }

        if (isConstructableUserClass(dateTimeLib)) {
            return new dateTimeLib(value);
        }

        return dateTimeLib(value);
    }

    /**
     * Cast the given value to a string.
     *
     * @param {string} _key
     * @param {any} value
     *
     * @private
     *
     * @return {string}
     */
    private castToString(_key: string, value: any): string {
        return String(value);
    }

    /**
     * Cast the given value to number, throw error if it can't be casted.
     *
     * @param {string} key
     * @param {any} value
     *
     * @private
     *
     * @return {number}
     */
    private castToNumber(key: string, value: any): number {
        const number = Number(value);

        if (isNaN(number)) {
            throw new LogicException(
                '\'' + key + '\' is not castable to a number type in \'' + (this as unknown as Model).getName() + '\'.'
            );
        }

        return number;
    }

    /**
     * Cast the given value to boolean, throw error if it can't be casted.
     *
     * @param {string} key
     * @param {any} value
     *
     * @private
     *
     * @return {boolean}
     */
    private castToBoolean(key: string, value: any): boolean {
        const string = String(value).toLowerCase();
        let boolean;

        if (['1', 'true'].includes(string)) {
            boolean = true;
        }

        if (['0', 'false'].includes(string)) {
            boolean = false;
        }

        if (typeof boolean !== 'boolean') {
            throw new LogicException(
                '\'' + key + '\' is not castable to a boolean type in \'' + (this as unknown as Model).getName() + '\'.'
            );
        }

        return boolean;
    }

    /**
     * Cast to date time using the configured library, throw error if it can't be casted.
     *
     * @param {string} _key
     * @param {any} value
     *
     * @private
     *
     * @return {any}
     */
    private castToDateTime(_key: string, value: any): unknown {
        return this.getDateTimeLibInstance(value);
    }

    /**
     * Cast using the custom casting object.
     *
     * @param {string} key
     * @param {any} value
     * @param {object} attributes
     * @param {string} method
     *
     * @private
     *
     * @return {any}
     */
    private castWithObject(
        key: string,
        value: any,
        attributes: Attributes,
        method: keyof AttributeCaster
    ): unknown {
        return (this.attributeCasts[key] as AttributeCaster)[method](value, attributes);
    }
}
