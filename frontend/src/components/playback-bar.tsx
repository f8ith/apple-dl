import { useDiscord } from "@/hooks/use-discord";
import { getOrDefaultImage } from "@/lib/apple-music";
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
import { useSidebar } from "@/components/ui/sidebar";
import {
  MicVocal,
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
  Volume2Icon,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDebounceCallback, useInterval } from "usehooks-ts";
import { SiDiscord } from "@icons-pack/react-simple-icons";

export default function PlaybackBar() {
  const {
    discordEnabled,
    playerState,
    header,
    usePlayerStateSubscription,
    usePlayPause,
    useSkip,
    disconnect,
  } = useDiscord();
  const headers = header;
  const [volume, setVolume] = useState<number>(33);
  const [seekTime, setSeekTime] = useState<number>(0);
  const [volumeUpdating, setVolumeUpdating] = useState(false);
  const [userSeeked, setUserSeeked] = useState(false);

  const { toggleSidebar } = useSidebar();

  usePlayerStateSubscription();

  useEffect(() => {
    if (playerState && playerState.current_song) {
      setVolume(playerState.volume * 100);
      setSeekTime(playerState.song_played ? playerState.song_played : 0);
    }
  }, [playerState]);

  const updateVolume = async (newVolume: number) => {
    if (
      !discordEnabled ||
      volumeUpdating ||
      !playerState ||
      Math.abs(playerState.volume - newVolume) < 0.01
    )
      return;

    setVolumeUpdating(true);
    await axios.put(
      "/api/v1/discord/volume",
      { volume: newVolume },
      { headers }
    );
    setVolumeUpdating(false);
  };

  const updateSeekTime = async (_: number) => {
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
    playerState &&
    playerState.current_song && (
      <div className="fixed bottom-0 z-[100] bg-background flex flex-row w-full gap-4 items-center">
        <div className="flex flex-col w-full">
          <Slider
            className="flex w-full"
            value={[seekTime]}
            onValueChange={(value) => {
              setUserSeeked(true);
              setSeekTime(value[0]);
              debUpdateSeekTime(value[0]);
            }}
            defaultValue={[seekTime]}
            max={playerState.current_song.length}
            step={1}
          />
          <div className="flex flex-row w-full items-center justify-center">
            <div className="flex-1 flex flex-col rounded-lg">
              <div className="flex flex-row gap-4 items-center py-4">
                <div className="max-w-[4vh] p-2">
                  <img
                    className="left-0 top-0 w-full h-full object-cover object-center transition duration-50 rounded-lg"
                    loading="lazy"
                    src={getOrDefaultImage(playerState.current_song)}
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
            </div>
            <div className="flex flex-row rounded-lg items-center gap-4 justify-center">
              <SkipBackIcon className="md:size-10 size-8" />
              {playerState.is_paused ? (
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
              <SkipForwardIcon
                onClick={() => {
                  useSkip.mutate({ params: { header } });
                }}
                className="md:size-10 size-8"
              />
            </div>
            <div className="flex-1 flex flex-row rounded-lg items-center gap-4 justify-end">
              <Popover>
                <PopoverTrigger asChild>
                  <SiDiscord />
                </PopoverTrigger>
                <PopoverContent className="z-[200] w-80">
                  <Card className="w-full ml-auto max-w-sm">
                    <CardHeader>
                      <CardTitle>{playerState.guild_name}</CardTitle>
                      <CardDescription>
                        connected to #{playerState.channel_name}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex-col gap-2">
                      <Button
                        variant="outline"
                        onClick={(_) => {
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
              <MicVocal
                onClick={() => {
                  toggleSidebar();
                }}
              />
              <Volume2Icon />
              <Slider
                className="max-w-[20vw] md:max-w-3xs pr-8"
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
        </div>
      </div>
    )
  );
}
