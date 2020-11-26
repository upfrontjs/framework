import Model from '../../../src/Eloquent/Model';
import Team from './Team';
import type Factory from '../../../src/Eloquent/Factory/Factory';
import UserFactory from '../Factories/UserFactory';

export default class User extends Model {
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
