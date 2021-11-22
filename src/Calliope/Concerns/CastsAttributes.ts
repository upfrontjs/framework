import LogicException from '../../Exceptions/LogicException';
import Collection from '../../Support/Collection';
import { cloneDeep, merge } from 'lodash';
import type AttributeCaster from '../../Contracts/AttributeCaster';
import GlobalConfig from '../../Support/GlobalConfig';
import type { Attributes, AttributeKeys } from './HasAttributes';
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
    protected attributeCasts = this.casts as Record<AttributeKeys<this> | string, CastType>;

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
    public mergeCasts(casts: Record<AttributeKeys<this> | string, CastType>): this {
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
    public setCasts(casts: Record<AttributeKeys<this> | string, CastType>): this {
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
    public hasCast(key: AttributeKeys<this> | string): key is BuiltInCastType | 'object' {
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
    protected getCastType(key: AttributeKeys<this> | string): BuiltInCastType | 'object' | undefined {
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
     * @param {string} method - The method to use when interacting with the AttributeCaster.
     *
     * @protected
     *
     * @internal
     *
     * @return {any}
     */
    protected castAttribute<T>(
        key: AttributeKeys<this> | string,
        value: any,
        method: keyof AttributeCaster = 'get'
    ): T {
        value = cloneDeep(value);

        if (!this.hasCast(key)) {
            return value;
        }

        switch (this.getCastType(key)) {
            case 'boolean':
                value = this.castToBoolean(key, value);
                break;
            case 'string':
                value = this.castToString(key, value);
                break;
            case 'number':
                value = this.castToNumber(key, value);
                break;
            case 'object':
                value = this.castWithObject(
                    key,
                    value,
                    (this as unknown as Model).getRawAttributes(),
                    method
                );
                break;
            case 'collection':
                if (method === 'set') {
                    if (Collection.isCollection(value)) {
                        // we don't want to wrap collection in a collection on every get
                        value = value.toArray();
                    }
                } else {
                    value = new Collection(value);
                }
                break;
            case 'datetime':
                if (method === 'set') {
                    // check if it throws
                    this.getDateTimeLibInstance(value);
                } else {
                    value = this.castToDateTime(key, value);
                }
                break;
            default:
                // either or both hasCast() and getCastType() has been overridden and hasCast()
                // returns true while getCastType() returns a value that lands in this default case
                throw new LogicException(
                    'Impossible logic path reached. getCastType() returned unexpected value.'
                );
        }

        return value;
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

        // class and function are both of type function
        if (typeof dateTimeLib !== 'function') {
            throw new InvalidArgumentException(
                '\'datetime\' is not of expected type set in the ' + GlobalConfig.name + '.'
            );
        }

        if (Object.is(Date, dateTimeLib)) {
            return new Date(value as Date | number | string);
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
