import Model from '../../../src/Eloquent/Model';
import User from './User';

export default class Team extends Model {
    users(): User {
        return this.hasMany(User);
    }
}
