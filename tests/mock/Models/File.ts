import Model from '../../../src/Calliope/Model';
import FileFactory from '../Factories/FileFactory';

/**
 * File Model.
 * Named FileModel to avoid naming clash with built-in File.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare
export default class File extends Model {
    public override getName(): string {
        return 'File';
    }

    public override get endpoint(): string {
        return 'files';
    }

    public factory(): FileFactory {
        return new FileFactory;
    }
}
