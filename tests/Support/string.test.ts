import * as str from '../../src/Support/string';
// eslint-disable-next-line @typescript-eslint/no-import-type-side-effects
import '../../src/string';
// The String/String.prototype methods are the same as the helper methods so can be tested at the same time

const sentence = 'The quick brown fox jumps over the lazy dog.' as const;

describe('string helpers', () => {
    describe('ucFirst()', () => {
        it('should capitalise the first letter', () => {
            expect(str.ucFirst('string')).toBe('String');

            expect('string'.ucFirst()).toBe('String');
        });
    });

    describe('isUuid()', () => {
        it('should determine whether the given string is uuid', () => {
            expect(str.isUuid(str.uuid())).toBe(true);

            expect(String.uuid().isUuid()).toBe(true);
            expect(String.isUuid(str.uuid())).toBe(true);
        });
    });

    describe('includesAll()', () => {
        it('should determine whether the given string is uuid', () => {
            expect(str.includesAll(sentence, ['brown', 'fox', 'the'])).toBe(true);
            expect(str.includesAll(sentence, ['purple', 'fox', 'the'])).toBe(false);

            expect(sentence.includesAll(['brown', 'fox', 'the'])).toBe(true);
            expect(sentence.includesAll(['purple', 'fox', 'the'])).toBe(false);
        });
    });

    describe('title()', () => {
        it('should convert to title case', () => {
            const expected = 'A Sample String';

            expect(str.title('_aSample-string-')).toBe(expected);

            expect('_aSample-string-'.title()).toBe(expected);
        });
    });

    describe('snake()', () => {
        it('should convert to snake case', () => {
            const expected = 'a_sample_string';

            expect(str.snake('aSample-string')).toBe(expected);

            expect('aSample-string'.snake()).toBe(expected);
        });
    });

    describe('finish()', () => {
        it('should add the given token if it is not already set', () => {
            expect(str.finish('strin', 'g')).toBe('string');
            expect(str.finish('string', 'g')).toBe('string');

            expect('strin'.finish('g')).toBe('string');
            expect('string'.finish('g')).toBe('string');
        });
    });

    describe('start()', () => {
        it('should add the given token if it is not already set', () => {
            expect(str.start('tring', 's')).toBe('string');
            expect(str.start('string', 's')).toBe('string');

            expect('tring'.start('s')).toBe('string');
            expect('string'.start('s')).toBe('string');
        });
    });

    describe('camel()', () => {
        it('should convert to camel case', () => {
            const expected = 'aSampleString';

            expect(str.camel('_a-sample string')).toBe(expected);

            expect('_a-sample string'.camel()).toBe(expected);
        });
    });

    describe('pascal()', () => {
        it('should convert to pascal case', () => {
            const expected = 'ASampleString';

            expect(str.pascal('_a-sample string')).toBe(expected);

            expect('_a-sample string'.pascal()).toBe(expected);
        });
    });

    describe('kebab()', () => {
        it('should convert to pascal case', () => {
            const expected = 'a-sample-string';

            expect(str.kebab('_A-sample string')).toBe(expected);

            expect('_A-sample string'.kebab()).toBe(expected);
        });
    });

    describe('plural()', () => {
        it('should pluralise strings', () => {
            expect(str.plural('car')).toBe('cars');
            expect(str.plural('goose')).toBe('geese');

            expect('car'.plural()).toBe('cars');
            expect('goose'.plural()).toBe('geese');
        });
    });

    describe('singular()', () => {
        it('should get the singular for of strings', () => {
            expect(str.singular('cars')).toBe('car');
            expect(str.singular('geese')).toBe('goose');

            expect('cars'.singular()).toBe('car');
            expect('geese'.singular()).toBe('goose');
        });
    });

    describe('before()', () => {
        it('should get the string before the given token', () => {
            expect(str.before(sentence, 'fox')).toBe('The quick brown ');

            expect(sentence.before('fox')).toBe('The quick brown ');
        });

        it('should return empty string if token not found', () => {
            expect(str.before(sentence, '4')).toBe('');

            expect(sentence.before('4')).toBe('');
        });

        it('should return empty sting if token is empty string', () => {
            expect(str.before(sentence, '')).toBe('');

            expect(sentence.before('')).toBe('');
        });

        it('should return empty string if the given value starts with the given token', () => {
            expect(str.before(sentence, sentence.slice(0, 1))).toBe('');

            expect(sentence.before(sentence.slice(0, 1))).toBe('');
        });
    });

    describe('beforeLast()', () => {
        it('should get the string before the given token', () => {
            expect(str.beforeLast(sentence, 'o')).toBe('The quick brown fox jumps over the lazy d');

            expect(sentence.beforeLast('o')).toBe('The quick brown fox jumps over the lazy d');
        });

        it('should return empty string if token not found', () => {
            expect(str.beforeLast(sentence, '4')).toBe('');

            expect(sentence.beforeLast('4')).toBe('');
        });

        it('should return empty sting if token is empty string', () => {
            expect(str.beforeLast(sentence, '')).toBe('');

            expect(sentence.beforeLast('')).toBe('');
        });

        it('should return empty string if the given value starts with the given token', () => {
            expect(str.beforeLast(sentence, sentence.slice(0, 1))).toBe('');

            expect(sentence.beforeLast(sentence.slice(0, 1))).toBe('');
        });
    });

    describe('after()', () => {
        it('should get the string after the given token', () => {
            expect(str.after(sentence, 'lazy')).toBe(' dog.');

            expect(sentence.after('lazy')).toBe(' dog.');
        });

        it('should an empty string if token not found', () => {
            expect(str.after(sentence, '4')).toBe('');

            expect(sentence.after('4')).toBe('');
        });

        it('should return empty sting if token is empty string', () => {
            expect(str.after(sentence, '')).toBe('');

            expect(sentence.after('')).toBe('');
        });

        it('should return empty string if the given value ends with the given token', () => {
            expect(str.after(sentence, sentence.slice(-1))).toBe('');

            expect(sentence.after(sentence.slice(-1))).toBe('');
        });
    });

    describe('afterLast()', () => {
        it('should get the string after thr given token', () => {
            expect(str.afterLast(sentence, 'h')).toBe('e lazy dog.');

            expect(sentence.afterLast('h')).toBe('e lazy dog.');
        });

        it('should and empty string if token not found', () => {
            expect(str.afterLast(sentence, '4')).toBe('');

            expect(sentence.afterLast('4')).toBe('');
        });

        it('should return empty sting if token is empty string', () => {
            expect(str.afterLast(sentence, '')).toBe('');

            expect(sentence.afterLast('')).toBe('');
        });

        it('should return empty string if the given value ends with the given token', () => {
            expect(str.afterLast(sentence, sentence.slice(-1))).toBe('');

            expect(sentence.afterLast(sentence.slice(-1))).toBe('');
        });
    });

    describe('limit()', () => {
        it('should limit the length of the string', () => {
            // the string length + the default appended value
            expect(str.limit(sentence, 10)).toHaveLength(13);
            expect(str.limit(sentence, 10)).toBe('The quick ...');

            expect(sentence.limit(10)).toHaveLength(13);
            expect(sentence.limit(10)).toBe('The quick ...');
        });

        it('should be able to take a custom string for appending at the end', () => {
            // the string length + the default appended value
            expect(str.limit(sentence, 10, '(...)')).toBe('The quick (...)');

            expect(sentence.limit(10, '(...)')).toBe('The quick (...)');
        });

        it('should not add the limiter if the length is equal or higher than the count', () => {
            expect(str.limit(sentence, sentence.length)).toBe(sentence);

            expect(sentence.limit(sentence.length + 1)).toBe(sentence);
        });
    });

    describe('words()', () => {
        it('should limit the number of words in the string', () => {
            expect(str.words(sentence, 3)).toBe('The quick brown...');

            expect(sentence.words(3)).toBe('The quick brown...');
        });

        it('should be able to take a custom string for appending at the end', () => {
            expect(str.words(sentence, 3, '(...)')).toBe('The quick brown(...)');

            expect(sentence.words(3, '(...)')).toBe('The quick brown(...)');
        });

        it('should not add the limiter if the word count is same as the given or lower.', () => {
            expect(str.words(sentence, sentence.split(' ').length)).toBe(sentence);

            expect(sentence.words(sentence.split(' ').length + 1)).toBe(sentence);
        });
    });

    describe('is()', () => {
        it('should correctly determine whether the given token matches the string', () => {
            expect(str.is(sentence, sentence)).toBe(true);
            expect(str.is(sentence, 'The quick*')).toBe(true);
            expect(str.is(sentence, 'The * dog.')).toBe(true);
            expect(str.is(sentence, 'the * dog.')).toBe(false);

            expect(sentence.is(sentence)).toBe(true);
            expect(sentence.is('The quick*')).toBe(true);
            expect(sentence.is('The * dog.')).toBe(true);
            expect(sentence.is('the * dog.')).toBe(false);
        });

        it('should ignore the case if the boolean set', () => {
            expect(str.is(sentence, 'the * dog.', true)).toBe(true);

            expect(sentence.is('the * dog.', true)).toBe(true);
        });
    });

    describe('uuid()', () => {
        it('should return a valid uuid', () => {
            // https://stackoverflow.com/a/13653180/11672649
            expect(str.uuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        });
    });
});
