import Model from '../../../src/Calliope/Model';
import Team from './Team';
import type Factory from '../../../src/Calliope/Factory/Factory';
import UserFactory from '../Factories/UserFactory';
import Shift from './Shift';
import Contract from './Contract';
import FileModel from './FileModel';

export default class User extends Model {
    public get endpoint(): string {
        return 'users';
    }

    protected initialise(): { guarded?: string[]; fillable?: string[] } {
        return {
            fillable: ['*']
        };
    }

    public factory(): Factory<this> {
        return new UserFactory;
    }

    public $invalidRelationDefinition(): Team {
        return new Team();
    }

    public $team(): Team {
        return this.belongsTo(Team, 'teamId');
    }

    public $teamWithoutForeignKey(): Team {
        return this.belongsTo(Team);
    }

    public $contract(): Contract {
        return this.hasOne(Contract, 'userId');
    }

    public $contractWithoutForeignKey(): Contract {
        return this.hasOne(Contract);
    }

    public $shifts(): Shift {
        return this.hasMany(Shift, 'userId');
    }

    public $shiftsWithoutForeignKey(): Shift {
        return this.hasMany(Shift);
    }

    public $inverseShifts(): Shift {
        return this.belongsToMany(Shift, 'shiftId');
    }

    public $inverseShiftsWithoutForeignKey(): Shift {
        return this.belongsToMany(Shift);
    }

    public $files(): FileModel {
        return this.morphMany(FileModel, 'User');
    }

    public $filesWithoutMorphName(): FileModel {
        return this.morphMany(FileModel);
    }

    public $file(): FileModel {
        return this.morphOne(FileModel, 'User');
    }

    public $fileWithoutMorphName(): FileModel {
        return this.morphOne(FileModel);
    }
}
