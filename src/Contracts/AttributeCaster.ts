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
     * @param {string} key
     * @param {any} value
     * @param {object} attributes - receives a clone of the raw attributes
     *
     * @return {any}
     */
    get: (key: string, value: unknown, attributes: Attributes) => any;

    /**
     * Transform the attribute to its underlying model values.
     *
     * @param {string} key
     * @param {any} value
     * @param {object} attributes - receives a clone of the raw attributes
     *
     * @return {void}
     */
    set: (key: string, value: unknown, attributes: Attributes) => void;
}
