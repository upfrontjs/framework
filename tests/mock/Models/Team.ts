import Model from '../../../src/Eloquent/Model';
import User from './User';
import type HasMany from '../../../src/Eloquent/Relations/HasMany';

export default class Team extends Model {
    users(): HasMany {
        return this.hasMany(User);
    }
}
