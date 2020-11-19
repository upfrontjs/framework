import Model from '../../../Illuminate/Eloquent/Model';
import Team from './Team';

export default class User extends Model {
    protected initialise(): { guarded?: string[]; fillable?: string[] } {
        return {
            fillable: ['*']
        };
    }

    team(): Model {
        return this.belongsTo(Team);
    }
}
