import { TItemType } from "@/lib/apple-music";
import { createContext } from "react";

export const DiscordContext = createContext<TDiscordContext>(
  {} as TDiscordContext
);

export interface TDiscordContext {
  discordEnabled: boolean;
  enabledItemTypes: TItemType[];
  guildId: string | null;
  playerId: string | null;
  headers: {
    "guild-id": string | null;
    "player-id": string | null;
  };
  playerState: any;
  connect: () => void;
  disconnect: () => void;
}
