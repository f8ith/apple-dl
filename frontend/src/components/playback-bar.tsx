import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
} from "@heroicons/react/16/solid";
import { SiDiscord } from "@icons-pack/react-simple-icons";
import { List, MicVocal, Volume2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounceCallback, useInterval } from "usehooks-ts";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { useDiscord } from "@/hooks/use-discord";
import { getImage } from "@/lib/apple-music";
import { useLayout } from "@/hooks/use-layout";
import { millisToStr } from "@/lib/utils";

// TODO: Progress is weird when song plays
export function PlaybackBar() {
  const {
    discordEnabled,
    header,
    playerStateOptions,
    usePlayerStateSubscription,
    usePlayPause,
    useSkip,
    useVolume,
    disconnect,
  } = useDiscord();
  const { data: playerState } = useQuery(playerStateOptions());
  const [volume, setVolume] = useState<number>(33);
  const [seekTime, setSeekTime] = useState<number>(0);
  const [userSeeked, setUserSeeked] = useState(false);

  const { toggleTab } = useLayout();

  usePlayerStateSubscription();

  useEffect(() => {
    if (playerState && playerState.current_song) {
      setVolume(playerState.volume * 100);
      setSeekTime(playerState.song_played ? playerState.song_played : 0);
    } else {
      setSeekTime(0);
    }
  }, [playerState]);

  const updateVolume = (newVolume: number) => {
    if (
      !discordEnabled ||
      useVolume.isPending ||
      !playerState ||
      Math.abs(playerState.volume - newVolume) < 0.01
    )
      return;

    useVolume.mutate({ params: { header }, body: { volume: newVolume } });
  };

  const updateSeekTime = async (_: number) => {
    // TODO Fix seek time
    //if (!discordEnabled || !userSeeked) return;

    //await axios.put(
    //  "/api/v1/discord/seek",
    //  { seek_time: newSeekTime },
    //  { headers }
    //);

    setUserSeeked(false);
  };

  useInterval(
    () => {
      setSeekTime((old) => {
        old += 5;
        return old;
      });
    },
    !userSeeked &&
      playerState &&
      playerState.current_song &&
      !playerState.is_paused
      ? 5
      : null
  );

  const debUpdateSeekTime = useDebounceCallback(updateSeekTime, 500);
  const debUpdateVolume = useDebounceCallback(updateVolume, 500);

  return (
    <div className="fixed bottom-0 p-4 h-[8vh] z-[100] bg-background flex flex-row w-full gap-4 items-center">
      {playerState && (
        <div className="flex flex-row w-full items-center justify-center">
          <div className="flex-1 flex flex-col rounded-lg">
            {playerState.current_song && (
              <div className="flex flex-row gap-4 items-center py-4">
                <div className="max-w-[4vh] p-2">
                  <img
                    className="left-0 top-0 w-full h-full object-cover object-center transition duration-50 rounded-lg"
                    loading="lazy"
                    src={getImage(playerState.current_song)}
                  ></img>
                </div>
                <div className="flex flex-col">
                  <p>{playerState.current_song.name}</p>
                  <p className="text-sm text-muted-foreground truncated">
                    {playerState.current_song.artist_name} —{" "}
                    {playerState.current_song.album_name}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4 items-center">
            <div className="flex flex-row rounded-lg gap-4 justify-center">
              <BackwardIcon className="md:size-10 size-8" />
              {playerState && playerState.is_paused ? (
                <PauseIcon
                  onClick={() => {
                    usePlayPause.mutate({ params: { header } });
                  }}
                  className="md:size-10 size-8"
                ></PauseIcon>
              ) : (
                <PlayIcon
                  onClick={() => {
                    usePlayPause.mutate({ params: { header } });
                  }}
                  className="md:size-10 size-8"
                />
              )}
              <ForwardIcon
                onClick={() => {
                  useSkip.mutate({ params: { header } });
                }}
                className="md:size-10 size-8"
              />
            </div>
            <div className="flex flex-row w-[16vw] justify-between">
              <p className="flex text-sm text-muted-foreground truncated">
                {playerState.current_song && millisToStr(seekTime)}
              </p>
              <Slider
                className="flex w-[80%]"
                value={[seekTime]}
                onValueChange={(value) => {
                  setUserSeeked(true);
                  setSeekTime(value[0]);
                  debUpdateSeekTime(value[0]);
                }}
                defaultValue={[seekTime]}
                max={
                  playerState.current_song ? playerState.current_song.length : Infinity
                }
                step={1}
              />
              <p className="flex text-sm text-muted-foreground truncated">
                {playerState.current_song &&
                  `-${millisToStr(playerState.current_song.length - seekTime)}`} 
              </p>
            </div>
          </div>
          <div className="flex-1 flex flex-row rounded-lg items-center gap-4 justify-end">
            <Popover>
              <PopoverTrigger asChild>
                <SiDiscord />
              </PopoverTrigger>
              <PopoverContent className="z-[200] w-80">
                <Card className="w-full ml-auto max-w-sm border-none">
                  <CardHeader>
                    <CardTitle>{playerState.guild_name}</CardTitle>
                    <CardDescription>
                      connected to #{playerState.channel_name}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        disconnect();
                      }}
                    >
                      {/* TODO Side effect: navigates to /discord-bot */}
                      Disconnect
                    </Button>
                  </CardFooter>
                </Card>
              </PopoverContent>
            </Popover>
            <List
              onClick={() => {
                toggleTab("queue");
              }}
            />
            <MicVocal
              onClick={() => {
                toggleTab("lyrics");
              }}
            />
            <Volume2Icon />
            <Slider
              className="w-[16vw] pr-8"
              value={[volume]}
              onValueChange={(value) => {
                setVolume(value[0]);
                debUpdateVolume(value[0] / 100);
              }}
              defaultValue={[volume]}
              max={100}
              step={1}
            />
          </div>
        </div>
      )}
    </div>
  );
}
