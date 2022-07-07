import EventEmitter from 'events';

export class SaferEmitter extends EventEmitter {
    emit(type: string, ...args: unknown[]) {
        let doError = type === 'error';

        let events = (this as any)._events;
        if (events !== undefined) doError = doError && events.error === undefined;
        else if (!doError) return false;

        // If there is no 'error' event listener then throw.
        if (doError) {
            let er;
            if (args.length > 0) er = args[0];
            if (er instanceof Error) {
                // Note: The comments on the `throw` lines are intentional, they show
                // up in Node's output if this results in an unhandled exception.
                throw er; // Unhandled 'error' event
            }
            // At least give some kind of context to the user
            let err = new Error('Unhandled error.' + (er ? ' (' + (er as any).message + ')' : ''));
            (err as any).context = er;
            throw err; // Unhandled 'error' event
        }

        let handler = events[type];
        if (handler === undefined) return false;
        if (typeof handler === 'function') {
            try {
                Reflect.apply(handler, this, args);
            } catch (error) {
                events[type] = undefined;
            }
        } else {
            let listeners = [...handler];

            listeners
                .filter((e) => {
                    try {
                        e.call;
                    } catch (error) {
                        return false;
                    }
                    return true;
                })
                .forEach((listener) => {
                    try {
                        Reflect.apply(listener, this, args);
                    } catch (error) {
                        console.error(error);
                    }
                });
        }
        return true;
    }
}
