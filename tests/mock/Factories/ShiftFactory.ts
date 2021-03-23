import Factory from '../../../src/Calliope/Factory/Factory';
import type { Attributes } from '../../../src/Calliope/Concerns/HasAttributes';
import type Shift from '../Models/Shift';

export default class ShiftFactory extends Factory<Shift> {
    public definition(): Attributes {
        return {
            startTime: new Date().toISOString(),
            finishTime: new Date(new Date().getHours() + 6)
        };
    }
}
