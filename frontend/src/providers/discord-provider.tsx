import { DiscordContext } from "@/contexts/discord-context";
import { usePersistString } from "@/hooks/use-persist-state";
import { useSocket } from "@/hooks/use-socket";
import { TItemType } from "@/lib/apple-music";
import axios from "axios";
import { useMemo, useState } from "react";

interface DiscordProviderProps {
  children: React.ReactNode;
}

export default function DiscordProvider({ children }: DiscordProviderProps) {
  const [guildId, setGuildId] = usePersistString("guild_id", "");
  const [playerId, setPlayerId] = usePersistString("player_id", "");
  const [playerState, setPlayerState] = useState(null);

  const [headers] = useState({
    guild_id: guildId,
    player_id: playerId,
  });

  const enabledItemTypes: TItemType[] = ["songs"];

  const { registerHandler } = useSocket();
  const [discordEnabled, setDiscordEnabled] = useState(false);

  const connect = () => {
    if (discordEnabled) return;

    const fetchPlayerState = async () => {
      const result = await axios.get("/api/discord/player_state", { headers });
      setPlayerState(result.data);

      setDiscordEnabled(true);
    };

    fetchPlayerState();

    function onPlayerStateChange(new_state: any) {
      setPlayerState(new_state);
    }

    registerHandler("player_state_update", onPlayerStateChange);
  };

  const disconnect = () => {
    setGuildId("");
    setPlayerId("");
    setDiscordEnabled(false);
  };

  const contextValue = useMemo(
    () => ({
      discordEnabled,
      guildId,
      playerId,
      headers,
      connect,
      disconnect,
      playerState,
      enabledItemTypes,
    }),
    [
      discordEnabled,
      guildId,
      playerId,
      headers,
      connect,
      disconnect,
      playerState,
      enabledItemTypes,
    ]
  );

  return (
    <DiscordContext.Provider value={contextValue}>
      {children}
    </DiscordContext.Provider>
  );
}
