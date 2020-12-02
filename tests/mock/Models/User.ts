import Model from '../../../src/Calliope/Model';
import Team from './Team';
import type Factory from '../../../src/Calliope/Factory/Factory';
import UserFactory from '../Factories/UserFactory';
import Shift from './Shift';
import File from './File';
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

    // @ts-ignore
    $team(): Team {
        // below comment is used in testing
        // return this.hasOne(Team, 'teamId');
        return this.belongsTo(Team, 'teamId');
    }

    $invalidRelationDefinition() {
        return this.BelongsTo(Team);
    }

    $teamDefinedWithoutForeignKey(): Team {
        return this.belongsTo(Team);
    }
    $contract(): Contract {
        return this.belongsTo(Contract);
    }

    $shifts(): Shift {
        return this.hasMany(Shift);
    }

    $files(): File {
        return this.morphs(File);
    }
}
