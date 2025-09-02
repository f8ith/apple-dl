import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDiscord } from "@/hooks/use-discord";
import { getOrDefaultImage, getShortLabel } from "@/lib/apple-music";
import { createFileRoute, Link, stripSearchParams } from "@tanstack/react-router";
import { ArrowUpToLineIcon, XIcon } from "lucide-react";

type DiscordBotSearch = {
  player_id: string | null;
};

// TODO does not adjust to sidebar
export const Route = createFileRoute("/discord-bot")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): DiscordBotSearch => {
    return {
      player_id: search.player_id ? (search.player_id as string) : null,
    };
  },
  beforeLoad: ({ search }) => {
    if (search.player_id) {
      sessionStorage.setItem("player_id", JSON.stringify(search.player_id));
    }

    // Return or redirect as needed
    return {};
  },
  search: {
    // strip default values
    middlewares: [stripSearchParams(true)],
  },
});

function RouteComponent() {
  const {
    discordEnabled,
    queue,
    playerState,
    usePlayNext,
    useRemoveSong,
    header,
    useQueueSubscription,
  } = useDiscord();

  useQueueSubscription();

  if (!discordEnabled)
    return (
      <div className="flex items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-sm items-center">
          <CardHeader>
            <CardTitle>not connected to discord</CardTitle>
          </CardHeader>
          <CardFooter className="flex-col gap-2">
            <Button
              asChild
              className="w-full"
              variant="link"
            >
              <Link to="/">return to home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );

  if (!playerState) return <></>;

  return (
    <main className="flex flex-col items-start justify-start p-8 gap-4">
      <div className="flex flex-row w-full gap-4 items-center">
        <h3 className="px-2 text-2xl font-semibold leading-none tracking-tight">
          Playing next
        </h3>
      </div>
      {queue && (
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
                        src={getOrDefaultImage(item)}
                      ></img>
                    </div>
                    <div className="flex flex-col">
                      <p>{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {getShortLabel(item)}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute flex flex-row gap-2 bottom-2 right-2">
                      <Button
                        className="size-8"
                        variant="secondary"
                        size="icon"
                        onClick={(_) => {
                          usePlayNext.mutate({
                            body: { id: item.id },
                            params: { header },
                          });
                        }}
                      >
                        <ArrowUpToLineIcon />
                      </Button>
                      <Button
                        className="size-8"
                        variant="secondary"
                        size="icon"
                        onClick={(_) => {
                          useRemoveSong.mutate({
                            body: { id: item.id },
                            params: { header },
                          });
                        }}
                      >
                        <XIcon />
                      </Button>
                    </div>
                  </div>
                  <Separator className="my-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
