import type { Attributes } from '../Calliope/Concerns/HasAttributes';

/**
 * Interface describes what's expected to be implemented
 * by a class that is tasked with value casting.
 *
 * @see {CastsAttributes.prototype.implementsCaster}
 */
export default interface AttributeCaster {
    /**
     * Transform the attribute from the underlying model value.
     *
     * @param {any} value
     * @param {object} attributes - receives a clone of the raw attributes
     *
     * @return {any}
     */
    get: (value: unknown, attributes: Attributes) => unknown;

    /**
     * Transform the attribute to its underlying model values.
     *
     * @param {any} value - the value to set
     * @param {object} attributes - receives a clone of the raw attributes
     *
     * @return {void}
     */
    set: (value: unknown, attributes: Attributes) => void;
}
