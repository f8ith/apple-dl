import {
  eventNames,
  SocketContext,
  SocketEventHandler,
  TEvent,
} from "@/contexts/socket-context";
import { socket } from "@/lib/socket";
import { useEffect, useMemo, useState } from "react";

let didInit = false;

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socketConnected, setSocketConnected] = useState(false);
  const [events, setEvents] = useState<Record<string, SocketEventHandler[]>>(
    {}
  );

  const registerHandler = (event_name: TEvent, handler: SocketEventHandler) => {
    setEvents((oldEvents) => {
      if (!oldEvents[event_name]) {
        oldEvents[event_name] = [handler];
      }
      oldEvents[event_name].push(handler);
      return oldEvents;
    });

    socket.on(event_name, handler);
  };

  const removeHandler = (event_name: TEvent, handler: SocketEventHandler) => {
    setEvents((oldEvents) => {
      const foundIndex = oldEvents[event_name].findIndex(handler);

      if (foundIndex > -1) {
        oldEvents[event_name].splice(foundIndex, 1);
      }
      return oldEvents;
    });

    socket.off(event_name, handler);
  };

  const emitEvent = (event_name: TEvent, ...args: any[]) => {
    socket.emit(event_name, ...args)
  }

  const contextValue = useMemo(
    () => ({
      socketConnected,
      registerHandler,
      removeHandler,
      emitEvent,
    }),
    [socketConnected, registerHandler, removeHandler, emitEvent]
  );

  useEffect(() => {
    if (!didInit) {
      didInit = true;

      function onConnect() {
        setSocketConnected(true);
        console.log("socket.io connected");
      }
      socket.on("connect", onConnect);

      return () => {
        socket.off("connect", onConnect);
        for (const eventName in eventNames) {
          if (events[eventName]) {
            for (const handler of events[eventName]) {
              socket.off(eventName, handler);
            }
          }
        }
      };
    }
  }, []);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}
