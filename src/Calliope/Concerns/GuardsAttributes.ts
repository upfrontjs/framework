import CastsAttributes from './CastsAttributes';
import type { Attributes, AttributeKeys } from './HasAttributes';

export default class GuardsAttributes extends CastsAttributes {
    /**
     * The attributes that are mass assignable.
     *
     * @protected
     *
     * @type {string[]}
     */
    protected fillableAttributes: (AttributeKeys<this> | string)[] = this.fillable;

    /**
     * The attributes that aren't mass assignable
     *
     * @protected
     *
     * @type {string[]}
     */
    protected guardedAttributes: (AttributeKeys<this> | string)[] = this.guarded;

    /**
     * The attributes that are mass assignable.
     *
     * @type {string[]}
     */
    public get fillable(): (AttributeKeys<this> | string)[] {
        return [];
    }

    /**
     * The attributes that are not mass assignable.
     *
     * @type {string[]}
     */
    public get guarded(): (AttributeKeys<this> | string)[] {
        return ['*'];
    }

    /**
     * Get the guarded attributes for the model.
     *
     * @return {string[]}
     */
    public getGuarded(): (AttributeKeys<this> | string)[] {
        return this.guardedAttributes;
    }

    /**
     * Get the fillable attributes for the model.
     *
     * @return {string[]}
     */
    public getFillable(): (AttributeKeys<this> | string)[] {
        return this.fillableAttributes;
    }

    /**
     * Merge new fillable attributes with existing fillable attributes on the model.
     *
     * @param {string[]} fillable
     *
     * @return {this}
     */
    public mergeFillable(fillable: (AttributeKeys<this> | string)[]): this {
        this.fillableAttributes = [...this.getFillable(), ...fillable];

        return this;
    }

    /**
     * Merge new guarded attributes with existing guarded attributes on the model.
     *
     * @param {string[]} guarded
     *
     * @return {this}
     */
    public mergeGuarded(guarded: (AttributeKeys<this> | string)[]): this {
        this.guardedAttributes = [...this.getGuarded(), ...guarded];

        return this;
    }

    /**
     * Set the fillable attributes for the model.
     *
     * @param {string[]} fillable
     *
     * @return {this}
     */
    public setFillable(fillable: (AttributeKeys<this> | string)[]): this {
        this.fillableAttributes = fillable;

        return this;
    }

    /**
     * Set the guarded attributes for the model.
     *
     * @param {string[]} guarded
     *
     * @return {this}
     */
    public setGuarded(guarded: (AttributeKeys<this> | string)[]): this {
        this.guardedAttributes = guarded;

        return this;
    }

    /**
     * Determine if the given attribute may be mass assignable.
     *
     * @param {string} key
     */
    public isFillable(key: AttributeKeys<this> | string): boolean {
        return this.getFillable().includes(key) || this.getFillable().includes('*');
    }

    /**
     * Determine if the given attribute may not be mass assignable.
     *
     * @param {string} key
     */
    public isGuarded(key: AttributeKeys<this> | string): boolean {
        // if key is defined in both guarded and fillable, then fillable takes priority.
        return (this.getGuarded().includes(key) || this.getGuarded().includes('*')) && !this.isFillable(key);
    }

    /**
     * Get the fillable attributes from the given object.
     *
     * @param {object} attributes
     *
     * @return {object}
     */
    protected getFillableFromObject(attributes: Attributes): Partial<Attributes> {
        const fillable: Attributes = {};
        if (this.getFillable().includes('*')) {
            return attributes;
        }

        Object.keys(attributes).forEach(name => {
            if (!this.isGuarded(name)) {
                fillable[name] = attributes[name];
            }
        });

        return fillable;
    }
}
