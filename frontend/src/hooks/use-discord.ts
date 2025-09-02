import { useEffect, useMemo, useState } from "react";

import { usePersistString } from "@/hooks/use-persist-state";
import { useSocket } from "@/hooks/use-socket";
import { $api } from "@/lib/api";
import { TItemType } from "@/lib/apple-music";
import { components, paths } from "@/openapi-schema";
import { useQueryClient } from "@tanstack/react-query";
import { useSessionStorage } from "usehooks-ts";
import { socket } from "@/lib/socket";

export function useDiscord() {
  const [playerId, setPlayerId, removePlayerId] = useSessionStorage<string>("player_id", "");
  const header = useMemo(
    () => ({
      "player-id": playerId,
    }),
    [playerId]
  );

  const discordEnabledItemTypes: TItemType[] = ["songs", "albums", "playlists"];

  const { registerHandler, emitEvent } = useSocket();
  const [discordEnabled, setDiscordEnabled] = useState(playerId != "");

  const connect = () => {
    if (discordEnabled) return;
    setDiscordEnabled(true);
    emitEvent("register_player_id", {"player-id": playerId});
  };

  const disconnect = () => {
    removePlayerId();
    setDiscordEnabled(false);
  };

  const playerStateQuery = $api.useQuery(
    "get",
    "/api/v1/discord/player_state",
    { params: { header: header } },
    { enabled: discordEnabled }
  );

  const playerQueueQuery = $api.useQuery(
    "get",
    "/api/v1/discord/queue",
    { params: { header: header } },
    { enabled: discordEnabled, initialData: [] }
  );

  const validPlayerStateQuery = $api.useQuery(
    "get",
    "/api/v1/discord/check_state",
    { params: { header } }
  );

  const useQueueMutation = $api.useMutation(
    "put",
    "/api/v1/discord/queue",
  );

  const useRemoveSong = $api.useMutation(
    "delete",
    "/api/v1/discord/remove_song"
  )

  const usePlayNext = $api.useMutation(
    "put",
    "/api/v1/discord/play_next",
  );


  const useSkip = $api.useMutation(
    "put",
    "/api/v1/discord/skip",
  );

  const usePlayPause = $api.useMutation(
    "put",
    "/api/v1/discord/play_pause",
  );
  
  const useLoop = $api.useMutation(
    "put",
    "/api/v1/discord/loop",
  );

  const useRepeat = $api.useMutation(
    "put",
    "/api/v1/discord/repeat",
  );


  useEffect(() => {
    // TODO Improve this spaghetti checking whether or not session is valid
    if (validPlayerStateQuery.isSuccess && validPlayerStateQuery.data) {
      const ok = validPlayerStateQuery.data && validPlayerStateQuery.data.valid;

      if (ok) connect();
      else disconnect();
    }
  }, [validPlayerStateQuery.isSuccess, validPlayerStateQuery.data]);

  const usePlayerStateSubscription = () => {
    const queryClient = useQueryClient();

    socket.emit("register_player_id", {
      "player-id": playerId
    })

    useEffect(() => {
      console.log("register player state");
      registerHandler(
        "player_state_changed",
        (newState: components["schemas"]["PlayerStateSchema"]) => {
          queryClient.setQueriesData(
            {
              queryKey: [
                "get",
                "/api/v1/discord/player_state",
                { params: { header } },
              ],
            },
            () => {
              return newState
            }
          );
        }
      );
    }, []);
  };

  const useQueueSubscription = () => {
    const queryClient = useQueryClient();
    useEffect(() => {
      console.log("register queue state");
      registerHandler(
        "player_queue_changed",
        (newState: paths["/api/v1/discord/queue"]["get"]["responses"]["200"]["content"]["application/json"]) => {
          queryClient.setQueriesData(
            {
              queryKey: [
                "get",
                "/api/v1/discord/queue",
                { params: { header } },
              ],
            },
            () => {
              return newState
            }
          );
        }
      );
    }, []);
  };



  return {
    discordEnabled,
    connect,
    disconnect,
    playerState: playerStateQuery.data,
    usePlayerStateSubscription,
    usePlayPause,
    useLoop,
    useRepeat,
    usePlayNext,
    useRemoveSong,
    useSkip,
    queue: playerQueueQuery.data,
    useQueueMutation,
    useQueueSubscription,
    header,
    discordEnabledItemTypes,
  };
}
