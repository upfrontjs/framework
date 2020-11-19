import Relation from './Relation';

export default class HasOne extends Relation {
    /**
     * @inheritDoc
     */
    protected getRelatedName(): string {
        return this.related.name.toLowerCase();
    }
}
