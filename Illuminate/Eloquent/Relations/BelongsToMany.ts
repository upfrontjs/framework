import Relation from './Relation';
// import ModelCollection from '../ModelCollection';
// import Collection from '../../Support/Collection';

export default class BelongsToMany extends Relation {
    /**
     * @inheritDoc
     */
    protected getRelatedName(): string {
        return this.related.name.toLowerCase().plural();
    }


    // public async sync(ids: Array<any>): Promise<Response> {
    //     let keys: string[] = [];
    //
    //     if (ModelCollection.isModelCollection(ids)) {
    //         keys = ids.modelKeys().map(id => String(id));
    //     }
    //
    //     if (!keys.length && Collection.isCollection(ids)) {
    //         keys = ids.map(id => String(id));
    //     }
    //
    //     if (!keys.length) {
    //         keys = ids.map(id => String(id));
    //     }
    //
    //     return this.getModel().post({ ids: keys });
    // }
}
