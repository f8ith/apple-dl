import { createContext } from "react";

export const SocketContext = createContext<TSocketContext>(
  {} as TSocketContext
);
export type SocketEventHandler = (...args: any[]) => void;

export interface SocketEvent {
  event_name: string;
  handler: SocketEventHandler;
}

export interface TSocketContext {
  socketConnected: boolean;
  registerHandler: (event_name: string, handler: SocketEventHandler) => void;
}
