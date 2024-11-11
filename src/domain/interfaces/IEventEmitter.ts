export interface IEventEmitter {
    emit: (eventName: string | symbol, payload: Record<string, any>) => void,
}
