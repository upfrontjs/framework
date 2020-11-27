import Model from '../../src/Calliope/Model';
import User from '../mock/Models/User';

let user: Model;

describe('model', () => {
    beforeEach(() => {
        user = User.factory().create() as User;
    });

    describe('construct()', () => {
        it('can instantiate a model',  () => {
            expect(user).toBeInstanceOf(Model);
        });
    });

    describe('getKeyName()', () => {
        it('can return the primary key\'s name',  () => {
            expect(user.setKeyName('uuid').getKeyName()).toBe('uuid');
        });
    });

    describe('setKeyName()', () => {
        it('can set the key name for the model',  () => {
            expect(user.getKeyName()).toBe('id');
            expect(user.setKeyName('uuid').getKeyName()).toBe('uuid');
        });
    });

    describe('getKey()', () => {
        it('can return the primary key for the model',  () => {
            expect(user.getKey()).toBe(1);
            expect(user.setKeyName('uuid').setAttribute('uuid', 'value').getKey()).toBe('value');
        });
    });

    describe('is()', () => {
        it('can determine whether two models are the same',  () => {
            expect(user.is(1)).toBe(false);
            expect(user.is({})).toBe(false);
            expect(user.is({ id: user.getKey() })).toBe(false);
            expect(user.is(User.factory().create())).toBe(false);

            expect(user.is(user)).toBe(true);
            expect(user.is(User.factory().create())).toBe(true);
        });
    });

    describe('isNot()', () => {
        it('can determine whether two models are not the same',  () => {
            expect(user.isNot(1)).toBe(true);
            expect(user.isNot({})).toBe(true);
            expect(user.isNot({ id: user.getKey() })).toBe(true);
            expect(user.isNot(User.factory().create())).toBe(true);

            expect(user.isNot(user)).toBe(false);
            expect(user.isNot(User.factory().create())).toBe(false);
        });
    });
});
