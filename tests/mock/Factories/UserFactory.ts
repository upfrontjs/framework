import Factory from '../../../src/Eloquent/Factory/Factory';
import type { Attributes } from '../../../src/Eloquent/Concerns/HasAttributes';
import Team from '../Models/Team';
import type Model from '../../../src/Eloquent/Model';

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
            team: team
        };
    }

    public nameOverridden(): Attributes {
        return {
            name: 'overridden name'
        };
    }

    public manager(): Attributes {
        return {
            type: () => 'manager'
        };
    }
}
