import { useDiscord } from "@/hooks/use-discord";
import { AMCardData, toAMCardData } from "@/lib/apple-music";
import { Slider } from "@/components/ui/slider";
import { PlayCircleIcon, Volume2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function PlaybackBar() {
  const { discordEnabled, playerState, headers } = useDiscord();
  const [currentSong, setCurrentSong] = useState<AMCardData>();
  const [volume, setVolume] = useState<number[]>([33]);
  const [volumeUpdating, setVolumeUpdating] = useState(false);

  useEffect(() => {
    if (playerState && playerState.current_song) {
      setCurrentSong(toAMCardData(playerState.current_song));
      setVolume([playerState.volume * 100]);
    }
  }, [playerState]);
  const updateVolumeReq = async (newVolume: number) => {
    if (volumeUpdating || Math.abs(playerState.volume - newVolume) < 0.01)
      return

    console.log(newVolume);

    setVolumeUpdating(true);
    await axios.put(
      "/api/v1/discord/volume",
      { volume: newVolume },
      { headers }
    );
    setVolumeUpdating(false);
  };

  useEffect(() => {
    const timeOutId = setTimeout(() => updateVolumeReq(volume[0]/ 100), 500);
    return () => clearTimeout(timeOutId);
  }, [volume]);


  return (
    currentSong && (
      <div className="fixed bottom-0 z-[100] flex flex-row w-full gap-4 mt-auto items-center">
        <div className="flex-1 flex flex-col rounded-lg fit-content justify-end">
          <div className="flex flex-row gap-4 items-center p-2">
            <div className="max-w-[4vh] p-2">
              <img
                className="left-0 top-0 w-full h-full object-cover object-center transition duration-50 rounded-lg"
                loading="lazy"
                src={currentSong.image}
              ></img>
            </div>
            <div className="flex flex-col">
              <p>{currentSong.name}</p>
              <p className="text-sm text-muted-foreground">
                {currentSong.artistName} — {currentSong.albumName}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-row rounded-lg fit-content justify-center">
          <PlayCircleIcon />
        </div>
        <div className="flex-1 flex flex-row rounded-lg fit-content px-16 gap-4 justify-end">
          <Volume2Icon />
          <Slider
            className="max-w-3xs"
            value={volume}
            onValueChange={(value) => {
              setVolume(value);
            }}
            defaultValue={volume}
            max={100}
            step={1}
          />
        </div>
      </div>
    )
  );
}
