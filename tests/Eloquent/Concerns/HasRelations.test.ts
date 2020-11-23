import HasRelations from '../../../src/Eloquent/Concerns/HasRelations';
import Team from '../../mock/Models/Team';

class TestClass extends HasRelations {
    team() {
        return this.belongsTo(Team);
    }
    getName(): string {
        return this.constructor.name;
    }

    protected initialise() {
        return {
            fillable: ['*']
        };
    }
}

let hasRelations: HasRelations;

describe('hasRelations', () => {
    beforeEach(() => {
        hasRelations = new TestClass({ team_id: 1 });
    });

    describe('relationDefined()', () => {
        it('can determine if a relation has been defined or not', () => {
            expect(hasRelations.relationDefined('team')).toBe(true);
            expect(hasRelations.relationDefined('user')).toBe(false);
        });
    });
});
