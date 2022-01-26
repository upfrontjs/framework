import Model from '../../../src/Calliope/Model';
import ShiftFactory from '../Factories/ShiftFactory';

export default class Shift extends Model {
    public override getName(): string {
        return 'Shift';
    }

    public factory(): ShiftFactory {
        return new ShiftFactory;
    }
}
