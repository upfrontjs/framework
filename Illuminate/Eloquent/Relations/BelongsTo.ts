import Relation from './Relation';
import type Model from '../Model';
import LogicException from '../../Exceptions/LogicException';

export default class BelongsTo extends Relation {
    protected foreignKey: string;

    constructor(model: Model, related: new (attributes?: Record<string, unknown>) => Model, foreignKey?: string) {
        super(model, related);

        this.foreignKey = foreignKey ?? this.getRelated().getForeignKey();
    }

    /**
     * @inheritDoc
     *
     * @protected
     */
    protected getEndpoint(): string {

        const foreignKey = this.getModel().getAttribute(this.foreignKey);

        if (!foreignKey) {
            throw new LogicException(this.getModel().getName() + ' doesn\'t have ' + this.foreignKey + ' defined.');
        }

        return this.getRelated().getEndpoint().finish('/') + String(foreignKey);
    }
}

