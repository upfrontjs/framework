import Factory from '../../../src/Calliope/Factory/Factory';
import type { Attributes } from '../../../src/Calliope/Concerns/HasAttributes';

export default class ShiftFactory extends Factory {
    definition(): Attributes {
        return {
            startTime: new Date().toISOString(),
            finishTime: new Date(new Date().getHours() + 6)
        };
    }
}
