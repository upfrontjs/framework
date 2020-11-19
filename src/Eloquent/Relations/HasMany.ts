import Relation from './Relation';

export default class HasMany extends Relation {
    /**
     * @inheritDoc
     */
    protected getRelatedName(): string {
        return this.related.constructor.name.finish('s');
    }
}
