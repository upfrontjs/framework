import Model from '../../../src/Calliope/Model';
import Team from './Team';
import type Factory from '../../../src/Calliope/Factory/Factory';
import UserFactory from '../Factories/UserFactory';

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

    $team(): Team {
        return this.belongsTo(Team);
    }
}
