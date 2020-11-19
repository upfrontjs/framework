import '../../Illuminate/Support/string';

describe('string helpers', () => {
    describe('ucFirst()', () => {
        it('can capitalise the first letter', () => {
            expect('string'.ucFirst()).toBe('String');
        });
    });
});
