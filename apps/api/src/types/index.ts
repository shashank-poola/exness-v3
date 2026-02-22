export interface EngineMessage {
    type: string;
    requestId: string;
    payload: string;
};
  
export interface StreamResponse {
    messages: Array<{ message: EngineMessage }>;
};
  
export type CallbackEntry<T = unknown> = {
    resolve: (value: T) => void;
    reject: (reason: unknown) => void;
};
