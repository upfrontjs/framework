import Model from '../../../src/Calliope/Model';
import Team from './Team';
import type Factory from '../../../src/Calliope/Factory/Factory';
import UserFactory from '../Factories/UserFactory';
import Shift from './Shift';
import Contract from './Contract';

export default class User extends Model {
    public get endpoint(): string {
        return 'users';
    }

    protected initialise(): { guarded?: string[]; fillable?: string[] } {
        return {
            fillable: ['*']
        };
    }

    factory(): Factory {
        return new UserFactory;
    }

    $invalidRelationDefinition(): Team {
        return new Team();
    }

    $team(): Team {
        return this.belongsTo(Team, 'teamId');
    }

    $teamWithoutForeignKey(): Team {
        return this.belongsTo(Team);
    }

    $contract(): Contract {
        return this.hasOne(Contract, 'userId');
    }

    $contractWithoutForeignKey(): Contract {
        return this.hasOne(Contract);
    }

    $shifts(): Shift {
        return this.hasMany(Shift, 'userId');
    }

    $shiftsWithoutForeignKey(): Shift {
        return this.hasMany(Shift);
    }

    $inverseShifts(): Shift {
        return this.belongsToMany(Shift, 'shiftId');
    }

    $inverseShiftsWithoutForeignKey(): Shift {
        return this.belongsToMany(Shift);
    }
}
