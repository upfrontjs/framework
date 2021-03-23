import Model from '../../../src/Calliope/Model';
import type Factory from '../../../src/Calliope/Factory/Factory';
import FileFactory from '../Factories/FileFactory';

export default class FileModel extends Model {
    public factory(): Factory<this> {
        return new FileFactory;
    }

    public $fileables(): FileModel {
        return this.morphTo();
    }
}
