import Factory from '../../../src/Calliope/Factory/Factory';
import type { Attributes } from '../../../src/Calliope/Concerns/HasAttributes';
import type Team from '../Models/Team';

export default class TeamFactory extends Factory<Team> {
    public override definition(): Attributes<Team> {
        return {
            name: 'Main'
        };
    }
}
