import CastsAttributes from './CastsAttributes';
import type { Attributes } from './HasAttributes';

export default class GuardsAttributes extends CastsAttributes {
    /**
     * The attributes that are mass assignable.
     *
     * @protected
     *
     * @type {string[]}
     */
    protected fillable: string[] = [];

    /**
     * The attributes that aren't mass assignable
     *
     * @protected
     *
     * @type {string[]}
     */
    protected guarded: string[] = ['*'];

    constructor() {
        super();
        this._setInitialVariables();
    }

    /**
     * Set member variables from object context.
     *
     * @return {{guarded?: string[], fillable?: string[]}}
     */
    protected initialise(): {guarded?: string[]; fillable?: string[]} {
        return {
            fillable: [],
            guarded: ['*']
        };
    }

    /**
     * Set variables related to guarding concerns.
     *
     * @private
     */
    private _setInitialVariables(): void {
        const variables = this.initialise();

        if (variables.fillable) {
            this.setFillable(variables.fillable);
        }

        if (variables.guarded) {
            this.setGuarded(variables.guarded);
        }
    }

    /**
     * Get the guarded attributes for the model.
     *
     * @return {string[]}
     */
    public getGuarded(): string[] {
        return this.guarded;
    }

    /**
     * Get the fillable attributes for the model.
     *
     * @return {string[]}
     */
    public getFillable(): string[] {
        return this.fillable;
    }

    /**
     * Merge new fillable attributes with existing fillable attributes on the model.
     *
     * @param {string[]} fillable
     *
     * @return {this}
     */
    public mergeFillable(fillable: string[]): this {
        this.fillable = [...this.getFillable(), ...fillable];

        return this;
    }

    /**
     * Merge new guarded attributes with existing guarded attributes on the model.
     *
     * @param {string[]} guarded
     *
     * @return {this}
     */
    public mergeGuarded(guarded: string[]): this {
        this.guarded = [...this.getGuarded(), ...guarded];

        return this;
    }

    /**
     * Set the fillable attributes for the model.
     *
     * @param {string[]} fillable
     *
     * @return {this}
     */
    public setFillable(fillable: string[]): this {
        this.fillable = fillable;

        return this;
    }

    /**
     * Set the guarded attributes for the model.
     *
     * @param {string[]} guarded
     *
     * @return {this}
     */
    public setGuarded(guarded: string[]): this {
        this.guarded = guarded;

        return this;
    }

    /**
     * Determine if the given attribute may be mass assignable.
     *
     * @param {string} key
     */
    public isFillable(key: string): boolean {
        return this.getFillable().includes(key) || this.getFillable().includes('*');
    }

    /**
     * Determine if the given attribute may not be mass assignable.
     *
     * @param {string} key
     */
    public isGuarded(key: string): boolean {
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
        if (this.getFillable().includes('*')) {
            return attributes;
        }

        Object.keys(attributes).forEach(name => {
            if (this.isGuarded(name)) {
                delete attributes[name];
            }
        });

        return attributes;
    }
}
