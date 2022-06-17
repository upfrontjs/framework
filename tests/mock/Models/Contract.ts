import Model from '../../../src/Calliope/Model';
import User from './User';
import ContractFactory from '../Factories/ContractFactory';

export default class Contract extends Model {
    public override getName(): string {
        return 'Contract';
    }

    public override get fillable(): string[] {
        return ['*'];
    }

    public factory(): ContractFactory {
        return new ContractFactory;
    }

    public $user(): User {
        return this.hasOne(User);
    }
}
