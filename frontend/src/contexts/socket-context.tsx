import { createContext } from "react";

export const SocketContext = createContext<TSocketContext>(
  {} as TSocketContext
);
export type SocketEventHandler = (...args: any[]) => void;

export const eventNames = ["connect", "status_update", "player_state_changed", "player_state_changed", "register_player_id"];
export type TEvent = (typeof eventNames)[number];

export interface TSocketContext {
  socketConnected: boolean;
  registerHandler: (event_name: TEvent, handler: SocketEventHandler) => void;
  removeHandler: (event_name: TEvent, handler: SocketEventHandler) => void;
  emitEvent: (event_name: TEvent, ...args: any[]) => void;
}
