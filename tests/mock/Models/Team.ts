import Model from '../../../src/Calliope/Model';
import User from './User';
import TeamFactory from '../Factories/TeamFactory';

export default class Team extends Model {
    public override getName(): string {
        return 'Team';
    }

    public get fillable(): string[] {
        return ['*'];
    }

    protected readonly timestamps = false;

    protected readonly softDeletes = false;

    public $users(): User {
        return this.hasMany(User);
    }

    public factory(): TeamFactory {
        return new TeamFactory;
    }
}
