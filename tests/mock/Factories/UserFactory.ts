import Factory from '../../../src/Calliope/Factory/Factory';
import type { Attributes } from '../../../src/Calliope/Concerns/HasAttributes';
import Team from '../Models/Team';
import type Model from '../../../src/Calliope/Model';

export default class UserFactory extends Factory {
    public definition(): Attributes {
        return {
            name: 'username 1'
        };
    }

    public withTeam(): Attributes {
        const team = Team.factory().create() as Model;

        return {
            team_id: team.getKey(),
            team: team // both model and attributes are acceptable
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
