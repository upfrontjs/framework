import Model from '../../../src/Calliope/Model';
import User from './User';
import ContractFactory from '../Factories/ContractFactory';
import Team from './Team';

type ContractableType = 'team' | 'user';

export default class Contract extends Model {
    public contractableId?: number;

    public contractableType?: ContractableType;

    public contractable?: Team | User;

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

    /**
     * Entities that may be contracted
     */
    public $contractable(): this {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return this.morphTo<Team | User>((self, _data) => {
            return self.contractableType === 'team' ? Team : User;
        });
    }
}
