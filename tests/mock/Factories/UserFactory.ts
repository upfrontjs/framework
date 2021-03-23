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
            // the foreign key is required at the same time with the team as when it
            // calls the relation at constructor we need to know the foreign key value upfront
            teamId: team.getKey(),
            // the team has to include the primary key to ensure sync.
            /** @see {HasRelations.prototype.addRelation} */
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
