import Factory from '../../../src/Calliope/Factory/Factory';
import type { Attributes } from '../../../src/Calliope/Concerns/HasAttributes';

export default class ContractFactory extends Factory {
    definition(): Attributes {
        return {
            startDate: new Date().toISOString(),
            endDate: null,
            rate: 1,
            active: true
        };
    }
}
