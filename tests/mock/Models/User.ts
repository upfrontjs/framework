import Model from '../../../src/Eloquent/Model';
import Team from './Team';

export default class User extends Model {
    protected initialise(): { guarded?: string[]; fillable?: string[] } {
        return {
            fillable: ['*']
        };
    }

    team(): Team {
        return this.belongsTo(Team);
    }
}
