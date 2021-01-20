import '../../src/Support/string';

const sentence = 'The quick brown fox jumps over the lazy dog.';

describe('string helpers', () => {
    describe('ucFirst()', () => {
        it('should capitalise the first letter', () => {
            expect('string'.ucFirst()).toBe('String');
        });
    });

    describe('isUuid()', () => {
        it('should determine whether the given string is uuid', () => {
            expect(String.uuid().isUuid()).toBe(true);
        });
    });

    describe('includesAll()', () => {
        it('should determine whether the given string is uuid', () => {
            expect(sentence.includesAll(['brown', 'fox', 'the'])).toBe(true);
            expect(sentence.includesAll(['purple', 'fox', 'the'])).toBe(false);
        });
    });

    describe('title()', () => {
        it('should convert to title case', () => {
            const expected = 'A Sample String';

            expect('_aSample-string-'.title()).toBe(expected);
        });
    });

    describe('snake()', () => {
        it('should convert to snake case', () => {
            const expected = 'a_sample_string';

            expect('aSample-string'.snake()).toBe(expected);
        });
    });

    describe('finish()', () => {
        it('should add the given token if it is not already set', () => {
            expect('strin'.finish('g')).toBe('string');
            expect('string'.finish('g')).toBe('string');
        });
    });

    describe('start()', () => {
        it('should add the given token if it is not already set', () => {
            expect('tring'.start('s')).toBe('string');
            expect('string'.start('s')).toBe('string');
        });
    });

    describe('camel()', () => {
        it('should convert to camel case', () => {
            const expected = 'aSampleString';

            expect('_a-sample string'.camel()).toBe(expected);
        });
    });

    describe('pascal()', () => {
        it('should convert to pascal case', () => {
            const expected = 'ASampleString';

            expect('_a-sample string'.pascal()).toBe(expected);
        });
    });

    describe('kebab()', () => {
        it('should convert to pascal case', () => {
            const expected = 'a-sample-string';

            expect('_A-sample string'.kebab()).toBe(expected);
        });
    });

    describe('plural()', () => {
        it('should pluralise strings', () => {
            expect('car'.plural()).toBe('cars');
            expect('goose'.plural()).toBe('geese');
        });
    });

    describe('singular()', () => {
        it('should get the singular for of strings', () => {
            expect('cars'.singular()).toBe('car');
            expect('geese'.singular()).toBe('goose');
        });
    });

    describe('before()', () => {
        it('should get the string before the given token', () => {
            expect(sentence.before('fox')).toBe('The quick brown ');
        });

        it('should the whole string if token not found', () => {
            expect(sentence.before('4')).toBe(sentence);
        });
    });

    describe('beforeLast()', () => {
        it('should get the string before thr given token', () => {
            expect(sentence.beforeLast('o')).toBe('The quick brown fox jumps over the lazy d');
        });

        it('should the whole string if token not found', () => {
            expect(sentence.beforeLast('4')).toBe(sentence);
        });
    });

    describe('after()', () => {
        it('should get the string after the given token', () => {
            expect(sentence.after('lazy')).toBe(' dog.');
        });

        it('should the whole string if token not found', () => {
            expect(sentence.after('4')).toBe(sentence);
        });
    });

    describe('afterLast()', () => {
        it('should get the string after thr given token', () => {
            expect(sentence.afterLast('h')).toBe('e lazy dog.');
        });

        it('should the whole string if token not found', () => {
            expect(sentence.afterLast('4')).toBe(sentence);
        });
    });

    describe('limit()', () => {
        it('should limit the length of the string', () => {
            // the string length + the default appended value
            expect(sentence.limit(10)).toHaveLength(13);
            expect(sentence.limit(10)).toBe('The quick ...');
        });

        it('should be able to take a custom string for appending at the end', () => {
            // the string length + the default appended value
            expect(sentence.limit(10, '(...)')).toBe('The quick (...)');
        });
    });

    describe('words()', () => {
        it('should limit the number of words in the string', () => {
            expect(sentence.words(3)).toBe('The quick brown...');
        });

        it('should be able to take a custom string for appending at the end', () => {
            expect(sentence.words(3, '(...)')).toBe('The quick brown(...)');
        });
    });

    describe('is()', () => {
        it('should determine whether the given toke matches the string', () => {
            expect(sentence.is(sentence)).toBe(true);
            expect(sentence.is('The quick*')).toBe(true);
            expect(sentence.is('The * dog.')).toBe(true);
        });

        it('should ignore the case if the boolean set', () => {
            expect(sentence.is('the * dog.', true)).toBe(true);
        });
    });
});
