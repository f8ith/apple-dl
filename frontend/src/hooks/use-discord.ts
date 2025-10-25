import { useCallback, useEffect, useMemo, useState } from "react";

import { useSocket } from "@/hooks/use-socket";
import { $api } from "@/lib/api";
import { TItemType } from "@/lib/apple-music";
import { components, paths } from "@/openapi-schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSessionStorage } from "usehooks-ts";

let didInit = false

export function useDiscord() {
  const [playerId, _setPlayerId, removePlayerId] = useSessionStorage<string>("player_id", "");
  const header = useMemo(
    () => ({
      "player-id": playerId,
    }),
    [playerId]
  );

  const discordEnabledItemTypes: TItemType[] = ["songs", "albums", "playlists"];

  const { registerHandler, emitEvent } = useSocket();
  const [discordEnabled, setDiscordEnabled] = useState(playerId != "");

  const connect = useCallback(() => {
    if (playerId && !didInit) {
      console.log(`registering to room ${playerId}`)
      emitEvent("register_player_id", { "player-id": playerId });
      didInit = true;
    }

    if (discordEnabled) return;
    setDiscordEnabled(true);
  }, [setDiscordEnabled, emitEvent, playerId, discordEnabled]);

  const disconnect = useCallback(() => {
    removePlayerId();
    setDiscordEnabled(false);
  }, [removePlayerId]);

  const playerStateOptions = () => $api.queryOptions(
    "get",
    "/api/v1/discord/player_state",
    { params: { header: header } },
    { enabled: discordEnabled }
  );

  const playerQueueOptions = () => $api.queryOptions(
    "get",
    "/api/v1/discord/queue",
    { params: { header: header } },
    { enabled: discordEnabled, initialData: [] }
  );

  const validPlayerStateOptions = () => $api.queryOptions(
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

  const useVolume = $api.useMutation(
    "put",
    "/api/v1/discord/volume"
  )

  const validPlayerState = useQuery(validPlayerStateOptions());

  useEffect(() => {
    // TODO Improve this spaghetti checking whether or not session is valid
    if (validPlayerState.isSuccess) {
      const ok = validPlayerState.data && validPlayerState.data.valid;

      if (ok) connect();
      else disconnect();
    }
  }, [validPlayerState.isSuccess, connect, disconnect]);

  const usePlayerStateSubscription = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
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
    }, [queryClient]);
  };

  // TODO: Fix queue updates
  const useQueueSubscription = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
      registerHandler(
        "player_queue_changed",
        (newState: paths["/api/v1/discord/queue"]["get"]["responses"]["200"]["content"]["application/json"]) => {
          console.log("queue updated")
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
    }, [queryClient]);
  };



  return {
    discordEnabled,
    connect,
    disconnect,
    playerStateOptions,
    usePlayerStateSubscription,
    usePlayPause,
    useLoop,
    useRepeat,
    usePlayNext,
    useRemoveSong,
    useSkip,
    useVolume,
    playerQueueOptions,
    useQueueMutation,
    useQueueSubscription,
    header,
    discordEnabledItemTypes,
  };
}
