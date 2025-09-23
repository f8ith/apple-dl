import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDiscord } from "@/hooks/use-discord";
import { getImage, getShortLabel } from "@/lib/apple-music";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpToLineIcon, XIcon } from "lucide-react";

export function DiscordQueue() {
  const {
    playerQueueOptions,
    playerStateOptions,
    usePlayNext,
    useRemoveSong,
    header,
    useQueueSubscription,
  } = useDiscord();

  const { data: playerState } = useQuery(playerStateOptions());
  const { data: queue } = useQuery(playerQueueOptions());

  useQueueSubscription();

  if (!playerState) return <></>;

  return (
    <div className="flex flex-col items-start justify-start gap-4">
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
                        src={getImage(item)}
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
    </div>
  );
}
