import Model from '../../../Illuminate/Eloquent/Model';
import User from './User';
import type HasMany from '../../../Illuminate/Eloquent/Relations/HasMany';

export default class Team extends Model {
    users(): HasMany {
        return this.hasMany(User);
    }
}
