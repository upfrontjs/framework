import Relation from './Relation';
import type Model from '../Model';

export default class Polymorphic extends Relation {
    constructor(model: Model, related: new (attributes?: Record<string, unknown>) => Model, morphName?: string) {
        super(model, related);
        this.model.resetEndpoint();

        this.model = new related();
        this.related = <typeof Model> model.constructor;
        morphName = morphName ?? this.getModel().getName().toLowerCase() + 'able';

        this.getModel()
            .where(this.getModel().getMorphs(morphName).type, '=', this.related.name)
            .where(this.getModel().getMorphs(morphName).id, '=', model.getKey());

        this.getModel().set
    }

    /**
     * Stub to satisfy the parent class.
     *
     * @protected
     *
     * @return {string}
     */
    protected getRelatedName(): string {
        return '';
    }
}
