import Model from '../../../src/Calliope/Model';
import FileFactory from '../Factories/FileFactory';

export default class FileModel extends Model {
    public override getName(): string {
        return 'FileModel';
    }

    public factory(): FileFactory {
        return new FileFactory;
    }

    public $fileables(): FileModel {
        return this.morphTo();
    }
}
