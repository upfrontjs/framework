import Model from '../../../src/Calliope/Model';
import type Factory from '../../../src/Calliope/Factory/Factory';
import FileFactory from '../Factories/FileFactory';

export default class File extends Model {
    factory(): Factory<this> {
        return new FileFactory;
    }

    public $fileable(): File {
        return this.morphTo();
    }
}
