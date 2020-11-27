import Factory from '../../../src/Calliope/Factory/Factory';
import type { Attributes } from '../../../src/Calliope/Concerns/HasAttributes';

export default class TeamFactory extends Factory {
    public definition(): Attributes {
        return {
            name: 'username 1'
        };
    }
}
