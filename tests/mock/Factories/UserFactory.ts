import Factory from '../../../src/Calliope/Factory/Factory';
import type { Attributes } from '../../../src/Calliope/Concerns/HasAttributes';
import Team from '../Models/Team';
import type User from '../Models/User';

export default class UserFactory extends Factory<User> {
    public definition(): Attributes {
        return {
            name: 'username 1'
        };
    }

    public withTeam(): Attributes {
        const team = Team.factory().create() as Team;

        return {
            team_id: team.getKey(),
            team: team // both model and model attributes are acceptable
        };
    }

    public nameOverridden(): Attributes {
        return {
            name: 'overridden name'
        };
    }

    public resolvedName(): Attributes {
        return {
            name: () => 'resolved name'
        };
    }
}
