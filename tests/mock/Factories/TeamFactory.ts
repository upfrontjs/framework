import Factory from '../../../src/Eloquent/Factory/Factory';
import type { Attributes } from '../../../src/Eloquent/Concerns/HasAttributes';

export default class TeamFactory extends Factory {
    public definition(): Attributes {
        return {
            name: 'username 1'
        };
    }
}
