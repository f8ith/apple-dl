import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDiscord } from "@/hooks/use-discord";
import { AMCardData, TBaseSong, toAMCardData } from "@/lib/apple-music";
import { Label } from "@radix-ui/react-label";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import axios from "axios";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";

type DiscordBotSearch = {
  guild_id: string | null;
  player_id: string | null;
};

const defaultValues = {
  guild_id: null,
  player_id: null,
};

// TODO: search params are not stripped?
export const Route = createFileRoute("/discord-bot")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): DiscordBotSearch => {
    return {
      guild_id: search.guild_id ? (search.guild_id as string) : null,
      player_id: search.player_id ? (search.player_id as string) : null,
    };
  },
  beforeLoad: ({ search }) => {
    if (search.guild_id && search.player_id) {
      sessionStorage.setItem("guild_id", search.guild_id);
      sessionStorage.setItem("player_id", search.player_id);
    }

    // Return or redirect as needed
    return {};
  },
  search: {
    // strip default values
    middlewares: [stripSearchParams(defaultValues)],
  },
});

function RouteComponent() {
  const [queue, setQueue] = useState<AMCardData[]>([]);

  const { discordEnabled, headers, disconnect, playerState } = useDiscord();

  useEffect(() => {
    const fun = async () => {
      const result = await axios.get("/api/discord/queue", { headers });

      setQueue(
        result.data.map((item: TBaseSong) => {
          return toAMCardData(item);
        })
      );
    };

    fun();
  }, []);

  if (!discordEnabled)
    return (
      <div className="flex h-[90vh] w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">not connected</div>
      </div>
    );

  return (
    <main className="flex flex-col items-start justify-start p-8 gap-4">
      <div className="flex flex-row w-full gap-4 items-center">
        <Label>
          Connected to {playerState.guild_name} in #{playerState.channel_name}
        </Label>
        <Button variant="outline" type="submit" onClick={(_) => disconnect()}>
          Disconnect
        </Button>
      </div>

      <h3 className="px-2 text-2xl font-semibold leading-none tracking-tight">
        Playing next
      </h3>

      <div className="dark:scheme-dark overflow-y-auto grow-1 min-w-0 h-[500px] w-full">
        <div className="grid grid-cols-1 -top-128 -mb-128">
          {queue.map((item, index: number) => {
            return (
              <div
                key={index}
                className="flex flex-col rounded-lg fit-content justify-end"
              >
                <div className="flex flex-row gap-4 items-center p-2">
                  <div className="max-w-[4vh] p-2">
                    <img
                      className="left-0 top-0 w-full h-full object-cover object-center transition duration-50 rounded-lg"
                      loading="lazy"
                      src={item.image}
                    ></img>
                  </div>
                  <div className="flex flex-col">
                    <p>{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.shortLabel}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute flex-row gap-2 bottom-2 right-2">
                    <Button
                      className="size-8"
                      variant="secondary"
                      size="icon"
                      onClick={async (_) => {}}
                    >
                      <PlusIcon />
                    </Button>
                  </div>
                </div>
                <Separator className="my-0" />
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
