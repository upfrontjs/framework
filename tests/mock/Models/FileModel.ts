import Model from '../../../src/Calliope/Model';
import type Factory from '../../../src/Calliope/Factory/Factory';
import FileFactory from '../Factories/FileFactory';

export default class FileModel extends Model {
    public override getName(): string {
        return 'FileModel';
    }

    public factory(): Factory<this> {
        return new FileFactory;
    }

    public $fileables(): FileModel {
        return this.morphTo();
    }
}
