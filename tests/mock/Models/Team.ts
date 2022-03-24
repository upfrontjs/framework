import Model from '../../../src/Calliope/Model';
import User from './User';
import TeamFactory from '../Factories/TeamFactory';

export default class Team extends Model {
    public override getName(): string {
        return 'Team';
    }

    public override get fillable(): string[] {
        return ['*'];
    }

    protected override readonly timestamps = false;

    protected override readonly softDeletes = false;

    public $users(): User {
        return this.hasMany(User);
    }

    public factory(): TeamFactory {
        return new TeamFactory;
    }
}
