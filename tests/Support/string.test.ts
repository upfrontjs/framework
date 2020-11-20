import '../../src/Support/string';

const sentence = 'The quick brown fox jumps over the lazy dog.';

describe('string helpers', () => {
    describe('ucFirst()', () => {
        it('can capitalise the first letter', () => {
            expect('string'.ucFirst()).toBe('String');
        });
    });

    describe('isUuid()', () => {
        it('can determine whether the given string is uuid', () => {
            expect(String.uuid().isUuid()).toBe(true);
        });
    });

    describe('includesAll()', () => {
        it('can determine whether the given string is uuid', () => {
            expect(sentence.includesAll(['brown', 'fox', 'the'])).toBe(true);
            expect(sentence.includesAll(['purple', 'fox', 'the'])).toBe(false);
        });
    });

    describe('title()', () => {
        it('can convert to title case', () => {
            const expected = 'A Sample String';

            expect('_aSample-string-'.title()).toBe(expected);
        });
    });

    describe('snake()', () => {
        it('can convert to snake case', () => {
            const expected = 'a_sample_string';

            expect('aSample-string'.snake()).toBe(expected);
        });
    });

    describe('finish()', () => {
        it('adds the given token if it is not already set', () => {
            expect('strin'.finish('g')).toBe('string');
            expect('string'.finish('g')).toBe('string');
        });
    });

    describe('start()', () => {
        it('adds the given token if it is not already set', () => {
            expect('tring'.start('s')).toBe('string');
            expect('string'.start('s')).toBe('string');
        });
    });

    describe('camel()', () => {
        it('can convert to camel case', () => {
            const expected = 'aSampleString';

            expect('_a-sample string'.camel()).toBe(expected);
        });
    });

    describe('pascal()', () => {
        it('can convert to pascal case', () => {
            const expected = 'ASampleString';

            expect('_a-sample string'.pascal()).toBe(expected);
        });
    });

    describe('kebab()', () => {
        it('can convert to pascal case', () => {
            const expected = 'a-sample-string';

            expect('_A-sample string'.kebab()).toBe(expected);
        });
    });

    describe('plural()', () => {
        it('can pluralise strings', () => {
            expect('car'.plural()).toBe('cars');
            expect('goose'.plural()).toBe('geese');
        });
    });

    describe('singular()', () => {
        it('can get the singular for of strings', () => {
            expect('cars'.singular()).toBe('car');
            expect('geese'.singular()).toBe('goose');
        });
    });

    describe('before()', () => {
        it('can get the string before the given token', () => {
            expect(sentence.before('fox')).toBe('The quick brown ');
        });

        it('returns the whole string if token not found', () => {
            expect(sentence.before('4')).toBe(sentence);
        });
    });

    describe('beforeLast()', () => {
        it('can get the string before thr given token', () => {
            expect(sentence.beforeLast('o')).toBe('The quick brown fox jumps over the lazy d');
        });

        it('returns the whole string if token not found', () => {
            expect(sentence.beforeLast('4')).toBe(sentence);
        });
    });

    describe('after()', () => {
        it('can get the string after the given token', () => {
            expect(sentence.after('lazy')).toBe(' dog.');
        });

        it('returns the whole string if token not found', () => {
            expect(sentence.after('4')).toBe(sentence);
        });
    });

    describe('afterLast()', () => {
        it('can get the string after thr given token', () => {
            expect(sentence.afterLast('h')).toBe('e lazy dog.');
        });

        it('returns the whole string if token not found', () => {
            expect(sentence.afterLast('4')).toBe(sentence);
        });
    });

    describe('limit()', () => {
        it('can limit the length of the string', () => {
            // the string length + the default appended value
            expect(sentence.limit(10)).toHaveLength(13);
            expect(sentence.limit(10)).toBe('The quick ...');
        });

        it('can specify the appended value', () => {
            // the string length + the default appended value
            expect(sentence.limit(10, '(...)')).toBe('The quick (...)');
        });
    });

    describe('words()', () => {
        it('can limit the number of words in the string', () => {
            expect(sentence.words(3)).toBe('The quick brown...');
        });

        it('can specify the appended value', () => {
            expect(sentence.words(3, '(...)')).toBe('The quick brown(...)');
        });
    });

    describe('is()', () => {
        it('determine whether the given toke matches the string', () => {
            expect(sentence.is(sentence)).toBe(true);
            expect(sentence.is('The quick*')).toBe(true);
            expect(sentence.is('The * dog.')).toBe(true);
        });

        it('can ignore the case if the boolean set', () => {
            expect(sentence.is('the * dog.', true)).toBe(true);
        });
    });
});
