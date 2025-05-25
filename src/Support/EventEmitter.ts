export type Listener<TArg = any> = (...args: TArg[]) => Promise<void> | void;
export type Events = Record<string, Listener[]>;

export default class EventEmitter<TEvents extends Events = Events> {
    /**
     * The singleton.
     *
     * @private
     */
    private static instance?: any;

    // mark constructor private so no newing up is allowed
    private constructor() {
    }

    /**
     * Get the singleton.
     */
    public static getInstance<TEvents extends Events>(): EventEmitter<TEvents> {
        if (!this.instance) {
            this.instance = new EventEmitter<TEvents>();
        }

        return this.instance;
    }

    /**
     * The Listeners that always run.
     *
     * @type {Record<string, Listener[]>}
     */
    protected listeners = {} as TEvents;

    /**
     * The Listeners that only runs once.
     *
     * @type {Record<string, Listener[]>}
     */
    protected listenersOnce = {} as TEvents;

    /**
     * Fire the event.
     *
     * @param event - The event name.
     * @param args - The arguments to pass to the listeners.
     */
    public async emit<P extends keyof TEvents>(
        event: P,
        ...args: Parameters<TEvents[P][number]>
    ): Promise<this> {
        if (event in this.listenersOnce) {
            await Promise.all(this.listenersOnce[event]!.map(async listener => listener(...args)));

            delete this.listenersOnce[event];
        }

        if (event in this.listeners) {
            await Promise.all(this.listeners[event]!.map(async listener => listener(...args)));
        }

        return this;
    }

    /**
     * Remove the listeners.
     *
     * @param {string=} event - only remove listeners for the given event
     * @param {CallableFunction=} listener - only remove the event listener that match the given listener.
     */
    public off<P extends keyof TEvents>(event?: P, listener?: TEvents[P][number]): this {
        const functionSignature = listener ? listener.toString() : '';

        if (!event) {
            if (listener) {
                Object.keys(this.listeners).forEach(eventName => {
                    this.listeners[eventName as P] =
                        this.listeners[eventName]!.filter(cb => cb.toString() !== functionSignature) as TEvents[P];
                });
                Object.keys(this.listenersOnce).forEach(eventName => {
                    this.listenersOnce[eventName as P] = this.listenersOnce[eventName]!
                        .filter(cb => cb.toString() !== functionSignature) as TEvents[P];
                });

                return this;
            }

            this.listeners = {} as TEvents;
            this.listenersOnce = {} as TEvents;
            return this;
        }

        if (listener) {
            if (Array.isArray(this.listeners[event])) {
                this.listeners[event]
                    = this.listeners[event]!.filter(cb => cb.toString() !== functionSignature) as TEvents[P];
            }

            if (Array.isArray(this.listenersOnce[event])) {
                this.listenersOnce[event]
                    = this.listenersOnce[event]!.filter(cb => cb.toString() !== functionSignature) as TEvents[P];
            }

            return this;
        }

        delete this.listeners[event];
        delete this.listenersOnce[event];

        return this;
    }

    /**
     * Bind the event listener.
     */
    public on<P extends keyof TEvents>(event: P, listener: Listener<Parameters<TEvents[P][number]>[number]>): this {
        if (!Array.isArray(this.listeners[event])) {
            this.listeners[event as keyof TEvents] = [] as unknown as TEvents[keyof TEvents];
        }

        // todo - check if the listener is already bound
        this.listeners[event]!.push(listener);

        return this;
    }

    /**
     * Bind the event listener that should only run once.
     */
    public once<P extends keyof TEvents>(event: P, listener: Listener<Parameters<TEvents[P][number]>[number]>): this {
        if (!Array.isArray(this.listenersOnce[event])) {
            this.listenersOnce[event] = [] as unknown as TEvents[P];
        }

        this.listenersOnce[event]!.push(listener);

        return this;
    }

    /**
     * Bind the event and to the front of the stack.
     */
    public prependListener<P extends keyof TEvents>(
        event: P,
        listener: Listener<Parameters<TEvents[P][number]>[number]>
    ): this {
        if (!Array.isArray(this.listeners[event])) {
            this.listeners[event as keyof TEvents] = [] as unknown as TEvents[keyof TEvents];
        }

        this.listeners[event]!.unshift(listener);

        return this;
    }

    /**
     * Bind the event that only runs once to the front of the stack.
     */
    public prependOnceListener<P extends keyof TEvents>(
        event: P,
        listener: Listener<Parameters<TEvents[P][number]>[number]>
    ): this {
        if (!Array.isArray(this.listenersOnce[event])) {
            this.listenersOnce[event] = [] as unknown as TEvents[P];
        }

        this.listenersOnce[event]!.unshift(listener);

        return this;
    }

    /**
     * Determine whether listeners exist.
     *
     * @param {string=} event - only check for listeners for the given event
     * @param {CallableFunction=} listener - only check for listeners that match this given listener
     */
    public has<P extends keyof TEvents>(
        event?: P,
        listener?: Listener<Parameters<TEvents[P][number]>[number]>
    ): boolean {
        if (!event) {
            if (listener) {
                return !!Object.keys(this.listeners).find(eventName => {
                    return !!this.listeners[eventName]!.filter(cb => cb.toString() === listener.toString()).length;
                })
                    || !!Object.keys(this.listenersOnce).find(eventName => {
                        return !!this.listenersOnce[eventName]!
                            .filter(cb => cb.toString() === listener.toString()).length;
                    });
            }

            return !!Object.keys(this.listeners).length || !!Object.keys(this.listenersOnce).length;
        }

        if (listener) {
            return !!this.listeners[event]?.filter(cb => cb.toString() === listener.toString()).length
                || !!this.listenersOnce[event]?.filter(cb => cb.toString() === listener.toString()).length;
        }

        return !!this.listeners[event]?.length || !!this.listenersOnce[event]?.length;
    }

    /**
     * Get the number of listeners registered.
     *
     * @param {string=} event - only count the listeners for the given event
     */
    public listenerCount(event?: keyof TEvents): number {
        let count = 0;

        if (event) {
            if (this.listeners[event]) {
                count += this.listeners[event]!.length;
            }

            if (this.listenersOnce[event]) {
                count += this.listenersOnce[event]!.length;
            }

            return count;
        }

        Object.keys(this.listeners).forEach(eventName => {
            count += this.listeners[eventName]!.length;
        });

        Object.keys(this.listenersOnce).forEach(eventName => {
            count += this.listenersOnce[eventName]!.length;
        });

        return count;
    }

    /**
     * Get all the even names currently listened to.
     */
    public eventNames(): (keyof TEvents)[] {
        return [...new Set([...Object.keys(this.listeners), ...Object.keys(this.listenersOnce)])];
    }
}
