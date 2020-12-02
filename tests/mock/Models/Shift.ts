import Model from '../../../src/Calliope/Model';
import type Factory from '../../../src/Calliope/Factory/Factory';
import ShiftFactory from '../Factories/ShiftFactory';

export default class Shift extends Model {
    factory(): Factory {
        return new ShiftFactory();
    }
}
