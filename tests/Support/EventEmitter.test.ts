import type { Events } from '../../src/Support/EventEmitter';
import EventEmitter from '../../src/Support/EventEmitter';

interface MyEvents extends Events {
    myEvent: ((payload?: number) => void)[];
}

/* eslint-disable @typescript-eslint/await-thenable */
describe('EventEmitter', () => {
    describe('on()', () => {
        afterEach(() => {
            EventEmitter.getInstance().off();
        });

        it('should execute registered listener on event dispatched', async () => {
            const emitter = EventEmitter.getInstance<MyEvents>();
            const myEventCb = jest.fn();

            emitter.on('myEvent', num => myEventCb(num));

            await emitter.emit('myEvent', 1);
            emitter.on('ds', (s: number) => s);
            await emitter.emit('ds');

            expect(myEventCb).toHaveBeenCalledWith(1);
        });

        it('should execute listeners in order they were added in', async () => {
            const emitter = EventEmitter.getInstance<MyEvents>();
            const myEventCb = jest.fn();

            emitter.on('myEvent', () => myEventCb(1));
            emitter.on('myEvent', () => myEventCb(2));

            await emitter.emit('myEvent');

            expect(myEventCb).toHaveBeenNthCalledWith(1, 1);
            expect(myEventCb).toHaveBeenNthCalledWith(2, 2);
        });
    });

    describe('once()', () => {
        afterEach(() => {
            EventEmitter.getInstance().off();
        });

        it('should only execute the listener once', async () => {
            const emitter = EventEmitter.getInstance<MyEvents>();
            const myEventCb = jest.fn();

            emitter.once('myEvent', num => myEventCb(num));
            await emitter.emit('myEvent', 1);
            await emitter.emit('myEvent', 1);

            expect(myEventCb).toHaveBeenCalledTimes(1);
        });
    });

    describe('prependListener()', () => {
        it('should execute the listener that has been added', async () => {
            const emitter = EventEmitter.getInstance<MyEvents>();
            const myEventCb = jest.fn();

            emitter.prependListener('myEvent', myEventCb);
            await emitter.emit('myEvent');

            expect(myEventCb).toHaveBeenCalledTimes(1);
        });

        it('should execute the prepended listener before other listeners', async () => {
            const emitter = EventEmitter.getInstance<MyEvents>();
            const myEventCb = jest.fn();

            emitter.on('myEvent', () => myEventCb(1));
            emitter.prependListener('myEvent', () => myEventCb(2));
            await emitter.emit('myEvent');

            expect(myEventCb).toHaveBeenNthCalledWith(1, 2);
            expect(myEventCb).toHaveBeenNthCalledWith(2, 1);
        });
    });

    describe('prependOnceListener()', () => {
        beforeEach(() => {
            EventEmitter.getInstance().off();
        });

        it('should execute the listener that has been added', async () => {
            const emitter = EventEmitter.getInstance<MyEvents>();
            const myEventCb = jest.fn();

            emitter.prependOnceListener('myEvent', myEventCb);
            await emitter.emit('myEvent');

            expect(myEventCb).toHaveBeenCalledTimes(1);
        });

        it('should execute the prepended once listener before other listeners', async () => {
            const emitter = EventEmitter.getInstance<MyEvents>();
            const myEventCb = jest.fn();

            emitter.on('myEvent', () => myEventCb(1));
            emitter.prependOnceListener('myEvent', () => myEventCb(2));
            await emitter.emit('myEvent');
            await emitter.emit('myEvent');

            expect(myEventCb).toHaveBeenCalledTimes(3);
            expect(myEventCb).toHaveBeenNthCalledWith(1, 2);
            expect(myEventCb).toHaveBeenNthCalledWith(2, 1);
            expect(myEventCb).toHaveBeenNthCalledWith(3, 1);
        });
    });

    describe('off()', () => {
        it('should not execute the listener if it was turned off', async () => {
            const myEventCb = jest.fn();
            const emitter = EventEmitter.getInstance<MyEvents>();

            emitter.on('myEvent', myEventCb);
            await emitter.emit('myEvent');
            emitter.off('myEvent');
            await emitter.emit('myEvent');

            expect(myEventCb).toHaveBeenCalledTimes(1);
        });

        it('should remove all listeners from always and once running listeners', async () => {
            const myEventCb = jest.fn();
            const myEventCbOnce = jest.fn();
            const otherEventCb = jest.fn();
            const emitter = EventEmitter.getInstance<MyEvents>();

            emitter.on('myEvent', myEventCb);
            emitter.once('myEvent', myEventCbOnce);
            emitter.on('otherEvent', otherEventCb);
            await emitter.emit('myEvent');
            await emitter.emit('otherEvent');
            emitter.off();
            await emitter.emit('myEvent');
            await emitter.emit('otherEvent');

            expect(myEventCb).toHaveBeenCalledTimes(1);
            expect(myEventCbOnce).toHaveBeenCalledTimes(1);
            expect(otherEventCb).toHaveBeenCalledTimes(1);

            emitter.off();
        });

        it('should remove the specified event listeners only from always and once running listeners', async () => {
            const myEventCb = jest.fn();
            const myEventCbOnce = jest.fn();
            const otherEventCb = jest.fn();
            const emitter = EventEmitter.getInstance<MyEvents>();

            emitter.on('myEvent', myEventCb);
            emitter.once('myEvent', myEventCbOnce);
            emitter.on('otherEvent', otherEventCb);
            await emitter.emit('myEvent');
            await emitter.emit('otherEvent');

            emitter.off('myEvent');

            await emitter.emit('myEvent');
            await emitter.emit('otherEvent');

            expect(myEventCb).toHaveBeenCalledTimes(1);
            expect(myEventCbOnce).toHaveBeenCalledTimes(1);
            expect(otherEventCb).toHaveBeenCalledTimes(2);
        });

        it('should remove the callback matching the signature of the given callback' +
            'from always and once running listeners', async () => {
            const myEventCb = jest.fn();
            const secondMock = jest.fn();
            const otherMyEventCb = () => secondMock();
            const emitter = EventEmitter.getInstance<MyEvents>();

            emitter.on('myEvent', myEventCb);
            emitter.on('myEvent', otherMyEventCb);
            await emitter.emit('myEvent');
            emitter.off('myEvent', myEventCb);
            await emitter.emit('myEvent');

            expect(myEventCb).toHaveBeenCalledTimes(1);
            expect(secondMock).toHaveBeenCalledTimes(2);
        });

        it('should remove all the listeners that match the given listener if no event name given', async () => {
            const myEventCb = jest.fn();
            const secondMock = jest.fn();
            const otherMyEventCb = () => secondMock();
            const emitter = EventEmitter.getInstance<MyEvents>();

            emitter.on('myEvent', myEventCb);
            emitter.on('myEvent', otherMyEventCb);
            await emitter.emit('myEvent');
            emitter.off(undefined, myEventCb);
            await emitter.emit('myEvent');

            expect(myEventCb).toHaveBeenCalledTimes(1);
            expect(secondMock).toHaveBeenCalledTimes(2);
        });
    });

    describe('emit()', () => {
        beforeEach(() => {
            EventEmitter.getInstance().off();
        });

        it('should trigger listeners', async () => {
            const emitter = EventEmitter.getInstance<MyEvents>();
            const myEventCb = jest.fn();

            emitter.on('myEvent', myEventCb);
            await emitter.emit('myEvent');

            expect(myEventCb).toHaveBeenCalledTimes(1);
        });

        it('should trigger listeners that runs once then remove them', async () => {
            const emitter = EventEmitter.getInstance<MyEvents>();
            const myEventCb = jest.fn();

            emitter.once('myEvent', myEventCb);
            await emitter.emit('myEvent');
            await emitter.emit('myEvent');

            expect(myEventCb).toHaveBeenCalledTimes(1);
        });

        it('should pass on any argument given to the listeners', async () => {
            const emitter = EventEmitter.getInstance<MyEvents>();
            const myEventCb = jest.fn();
            const myOtherEventCB = jest.fn();

            emitter.on('myEvent', myEventCb);
            emitter.on('myOtherEvent', myOtherEventCB);
            await emitter.emit('myEvent', 1);
            await emitter.emit('myOtherEvent', 1, '1', [1]);

            expect(myEventCb).toHaveBeenCalledWith(1);
            expect(myOtherEventCB).toHaveBeenCalledWith(1, '1', [1]);
        });

        it('should handle promises', async () => {
            const emitter = EventEmitter.getInstance<MyEvents>();
            const myEventCb = jest.fn(async () => Promise.resolve(1));

            emitter.once('myEvent', myEventCb);
            await emitter.emit('myEvent');

            expect(myEventCb).toHaveBeenCalledTimes(1);
        });

        it('should first run once listeners', async () => {
            const emitter = EventEmitter.getInstance<MyEvents>();
            const myEventCb = jest.fn();

            emitter.on('myEvent', () => myEventCb(1));
            emitter.once('myEvent', () => myEventCb(2));
            await emitter.emit('myEvent');

            expect(myEventCb).toHaveBeenCalledTimes(2);
            expect(myEventCb).toHaveBeenNthCalledWith(1, 2);
            expect(myEventCb).toHaveBeenNthCalledWith(2, 1);
        });
    });

    describe('has()', () => {
        beforeEach(() => {
            EventEmitter.getInstance().off();
        });

        it('should determine if there are event listeners', () => {
            const emitter = EventEmitter.getInstance<MyEvents>();

            expect(emitter.has()).toBe(false);
            emitter.on('myEvent', () => ({}));
            expect(emitter.has()).toBe(true);
        });

        it('should determine if there are event listeners for the given event', () => {
            const emitter = EventEmitter.getInstance<MyEvents>();

            expect(emitter.has('myEvent')).toBe(false);
            emitter.on('myEvent', () => ({}));
            expect(emitter.has('myEvent')).toBe(true);
        });

        it('should determine if there are event listeners for the given event that match the given function', () => {
            const emitter = EventEmitter.getInstance<MyEvents>();

            emitter.on('myEvent', () => {});
            emitter.on('myEvent', () => 1);
            expect(emitter.has('myEvent', () => {})).toBe(true);
            expect(emitter.has('myEvent', () => 2)).toBe(false);
        });

        it('should determine if there are event listeners that match the given function', () => {
            const emitter = EventEmitter.getInstance<MyEvents>();

            emitter.once('myEvent', () => 1);
            expect(emitter.has(undefined, () => 1)).toBe(true);
        });
    });

    describe('listenerCount()', () => {
        beforeEach(() => {
            EventEmitter.getInstance().off();
        });

        it('should get the listener count for all events', () => {
            const emitter = EventEmitter.getInstance<MyEvents>();

            emitter.on('myEvent', () => ({}));
            emitter.once('myEvent', () => ({}));
            emitter.once('someEvent', () => ({}));

            expect(emitter.listenerCount()).toBe(3);
        });

        it('should get the listener count only for the given event', () => {
            const emitter = EventEmitter.getInstance<MyEvents>();

            emitter.on('myEvent', () => ({}));
            emitter.once('myEvent', () => ({}));
            emitter.once('someEvent', () => ({}));

            expect(emitter.listenerCount('myEvent')).toBe(2);
        });
    });

    describe('eventNames()', () => {
        beforeEach(() => {
            EventEmitter.getInstance().off();
        });

        it('should return the event names', () => {
            const emitter = EventEmitter.getInstance<MyEvents>();

            emitter.on('myEvent', () => ({}));
            emitter.on('myOtherEvent', () => ({}));

            expect(emitter.eventNames()).toStrictEqual(['myEvent', 'myOtherEvent']);
        });

        it('should remove duplicates', () => {
            const emitter = EventEmitter.getInstance<MyEvents>();

            emitter.on('myEvent', () => ({}));
            emitter.once('myEvent', () => ({}));

            expect(emitter.eventNames()).toStrictEqual(['myEvent']);
        });
    });
});
