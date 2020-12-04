import Model from '../../../src/Calliope/Model';
import User from './User';
import type Factory from '../../../src/Calliope/Factory/Factory';
import TeamFactory from '../Factories/TeamFactory';

export default class Team extends Model {
    protected initialise(): { guarded?: string[]; fillable?: string[] } {
        return {
            fillable: ['*']
        };
    }

    protected readonly timestamps = false;

    $users(): User {
        return this.hasMany(User);
    }

    factory(): Factory<this> {
        return new TeamFactory;
    }
}
