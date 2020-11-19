import LogicException from '../../Exceptions/LogicException';
import Collection from '../../Support/Collection';
import cloneDeep from 'lodash/cloneDeep';

export type CastType = 'boolean' | 'string' | 'dateTime' | 'number' | 'collection' | 'class';

export default class CastsAttributes {
    /**
     * The attributes that should be cast.
     *
     * @protected
     *
     * @type {object}
     */
    protected casts: Record<string, CastType|AttributeCasting>= {};

    /**
     * Merge new casts with existing casts on the model.
     *
     * @param {object} casts
     *
     * @return {this}
     */
    public mergeCasts(casts: Record<string, CastType|AttributeCasting>): this {
        this.casts = cloneDeep(casts);

        return this;
    }

    /**
     * Determine whether an attribute should be cast to a native type.
     *
     * @param {string} key
     *
     * @return {boolean}
     */
    public hasCast(key: string): key is CastType {
        const cast = this.getCastType(key);

        if (!cast) {
            return false;
        }

        return ['boolean', 'dateTime', 'number', 'collection', 'class', 'string'].includes(cast);
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
    protected getCastType(key: string): string|undefined {
        const caster = this.casts[key];

        if (!caster) {
            return undefined;
        }

        if (this.implementsCaster(caster)) {
            return 'class';
        }

        return caster.toLowerCase().trim();
    }

    /**
     * Cast the attribute to the specified type.
     *
     * @param {string} key
     * @param {any} value
     *
     * @protected
     *
     * @return {any}
     */
    protected castAttribute(key: string, value: any): unknown {
        let result: unknown;

        if (this.hasCast(key)) {
            const cast = this.getCastType(key);

            if (cast === 'boolean') {
                const string = String(value);
                let boolean;

                if (['1', 'true'].includes(string.toLowerCase())) {
                    boolean = true;
                }

                if (['0', 'false'].includes(string.toLowerCase())) {
                    boolean = false;
                }

                if (typeof boolean !== 'boolean') {
                    throw new LogicException(
                        '\'' + key + '\' is not castable to a boolean type in ' + this.constructor.name
                    );
                }

                result = boolean;
            }
            else if (cast === 'number') {
                const number = Number(value);

                if (isNaN(number)) {
                    throw new LogicException(
                        '\'' + key + '\' is not castable to a number type in ' + this.constructor.name
                    );
                }

                result = number;
            }
            else if (cast === 'string') {
                result = String(value);
            }
            else if (cast === 'collection') {
                if (!Array.isArray(value)) {
                    throw new LogicException(
                        '\'' + key + '\' is not castable to a collection type in ' + this.constructor.name
                    );
                }

                result = new Collection(value);
            }
            else if (cast === 'dateTime') {
                //todo - DateTime
            }
            else if (cast === 'class') {
                result = (this.casts[key] as AttributeCasting).get(key, value);
            }
            else {
                // either or both hasCast() and getCastType() has been overridden and hasCast()
                // returns true while getCastType() cannot determine the cast type
                throw new LogicException('Impossible logic path reached. ' +
                    'hasCast() and getCastType() implementations are not in sync');
            }
        } else {
            result = value;
        }

        return result;
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
    protected implementsCaster(value: any): value is AttributeCasting {
        if (!value || value !== Object(value)) {
            return false;
        }

        const object = value as Record<string, unknown>;

        return 'set' in object
            && object['set'] instanceof Function
            && 'get' in object
            && object['get'] instanceof Function;
    }
}

export interface AttributeCasting {
    /**
     * Transform the attribute from the underlying model value.
     *
     * @param {string} key
     * @param {any} value
     *
     * @return {any}
     */
    get(key: string, value: unknown): unknown;

    /**
     * Transform the attribute to its underlying model values.
     *
     * @param {string} key
     * @param {any} value
     *
     * @return {void}
     */
    set(key: string, value: unknown): void;
}
