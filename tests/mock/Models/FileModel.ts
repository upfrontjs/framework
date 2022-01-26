import Model from '../../../src/Calliope/Model';
import FileFactory from '../Factories/FileFactory';

/**
 * File Model.
 * Named FileModel to avoid naming clash with built-in File.
 */
export default class FileModel extends Model {
    public override getName(): string {
        return 'FileModel';
    }

    public get endpoint(): string {
        return 'files';
    }

    public factory(): FileFactory {
        return new FileFactory;
    }

    public $fileables(): FileModel {
        return this.morphTo();
    }
}
