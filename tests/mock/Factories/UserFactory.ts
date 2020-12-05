import Factory from '../../../src/Calliope/Factory/Factory';
import type { Attributes } from '../../../src/Calliope/Concerns/HasAttributes';
import Team from '../Models/Team';
import type User from '../Models/User';

export default class UserFactory extends Factory<User> {
    public definition(_model: User, index: number): Attributes {
        return {
            name: 'username ' + String(index)
        };
    }

    public withTeam(): Attributes {
        const team = Team.factory().create() as Team;

        return {
            teamId: team.getKey(),
            team: team // both model and model attributes are acceptable
        };
    }

    public nameOverridden(): Attributes {
        return {
            name: 'overridden name'
        };
    }

    public calledWithArguments(model: User, index: number): Attributes {
        return {
            modelAttribute: model.getName(),
            index
        };
    }

    public resolvedName(): Attributes {
        return {
            name: () => 'resolved name'
        };
    }
}
