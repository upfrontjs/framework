import HasRelations from '../../../Illuminate/Eloquent/Concerns/HasRelations';
import Team from '../../mock/Models/Team';

class TestClass extends HasRelations {
    team() {
        return this.belongsTo(Team);
    }
}

let hasRelations: HasRelations;

describe('hasRelations', () => {
    beforeEach(() => {
        hasRelations = new TestClass();
    });

    describe('relationDefined()', () => {
        it('can determine if a relation has been defined or not', () => {
            expect(hasRelations.relationDefined('team')).toBe(true);
        });
    });
});
