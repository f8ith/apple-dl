import {
  SocketContext,
  SocketEvent,
  SocketEventHandler,
} from "@/contexts/socket-context";
import { socket } from "@/lib/socket";
import { useEffect, useMemo, useState } from "react";

interface SocketProviderProps {
  children: React.ReactNode;
}

export default function SocketProvider({ children }: SocketProviderProps) {
  const [socketConnected, setSocketConnected] = useState(false);
  const [events, setEvents] = useState<SocketEvent[]>([]);

  const registerHandler = (event_name: string, handler: SocketEventHandler) => {
    setEvents((oldEvents) => {
      oldEvents.push({ event_name, handler });
      return oldEvents;
    });

    socket.on(event_name, handler);
  };

  const contextValue = useMemo(
    () => ({
      socketConnected,
      registerHandler,
    }),
    [socketConnected, registerHandler]
  );

  useEffect(() => {
    function onConnect() {
      setSocketConnected(true);
      console.log("socket.io connected");
    }

    registerHandler("connect", onConnect);

    return () => {
      for (const event of events) {
        socket.off(event.event_name, event.handler);
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}
