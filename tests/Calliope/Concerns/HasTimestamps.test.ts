import User from '../../mock/Models/User';

let hasTimestamps: User;

describe('hasTimestamps', () => {
    beforeEach(() => {
        hasTimestamps = new User();
    });

    describe('getCreatedAtColumn', () => {
        it('should return the createdAt column', () => {
            expect(hasTimestamps.getCreatedAtColumn()).toBe('createdAt');
        });
    });
});
