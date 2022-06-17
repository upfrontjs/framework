import Factory from '../../../src/Calliope/Factory/Factory';
import type { Attributes } from '../../../src/Calliope/Concerns/HasAttributes';
import type Contract from '../Models/Contract';

export default class ContractFactory extends Factory<Contract> {
    public override definition(): Attributes<Contract> {
        return {
            startDate: new Date().toISOString(),
            endDate: null,
            rate: 1,
            active: true
        };
    }
}
