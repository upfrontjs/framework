import Model from '../../../src/Calliope/Model';
import FolderFactory from '../Factories/FolderFactory';

export default class Folder extends Model {
    public id = 0;

    public name = '';

    public parentId = 0;

    public override get keyType(): 'number' {
        return 'number';
    }

    public override getName(): string {
        return 'Folder';
    }

    public factory(): FolderFactory {
        return new FolderFactory;
    }

    public $parent(): Folder {
        return this.belongsTo(Folder, 'parentId');
    }

    public $children(): Folder {
        return this.hasMany(Folder, 'parentId');
    }
}
