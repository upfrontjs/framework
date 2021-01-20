import Model from '../../../src/Calliope/Model';
import User from './User';
import ContractFactory from '../Factories/ContractFactory';
import type Factory from '../../../src/Calliope/Factory/Factory';

export default class Contract extends Model {
    protected initialise(): { guarded?: string[]; fillable?: string[] } {
        return {
            fillable: ['*']
        };
    }

    public factory(): Factory<this> {
        return new ContractFactory;
    }

    public $user(): User {
        return this.hasOne(User);
    }
}
