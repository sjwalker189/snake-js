export class EventEmitter {
    protected listeners = new Map<string, Set<(value: any) => void>>();

    emit(msg: string, value: any) {
        if (!this.listeners.has(msg)) {
            return;
        }

        for (const handler of this.listeners.get(msg)!.values()) {
            handler(value);
        }
    }

    on(msg: string, cb: (value: any) => void) {
        if (this.listeners.has(msg)) {
            this.listeners.get(msg)!.add(cb);
        } else {
            this.listeners.set(msg, new Set([cb]));
        }

        return () => {
            this.listeners.get(msg)?.delete(cb);
        }
    }
}