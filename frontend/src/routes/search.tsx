import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AMCardData,
  itemTypes,
  TBaseSong,
  toAMCardData,
} from "@/lib/apple-music";

import axios from "axios";
import {
  KeyboardEventHandler,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { CheckIcon, DownloadIcon, XIcon } from "lucide-react";
import { SiDiscord } from "@icons-pack/react-simple-icons";
import { DiscordContext } from "@/contexts/discord-context";
import { useJobs } from "@/hooks/use-jobs";
import { usePersistState } from "@/hooks/use-persist-state";

export const Route = createFileRoute("/search")({
  component: Search,
});

function Search() {
  const [searchTerm, setSearchTerm] = usePersistState<string>("searchTerm", "");
  const { submitJob } = useJobs();
  const [items, setItems] = usePersistState<AMCardData[]>("searchItems", []);
  const { headers, discordEnabled, enabledItemTypes } =
    useContext(DiscordContext);

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      handleSearch(searchTerm);
    }
  };

  const handleSearch = async (str: string) => {
    console.log(searchTerm);
    setItems([]);
    if (str.startsWith("https://music.apple.com")) {
      submitJob(str);
    } else {
      const data = await searchItems(str);
      const newItems: AMCardData[] = [];

      for (const itemType of itemTypes) {
        if (data[itemType]) {
          newItems.push(
            ...data[itemType].data.map((val: TBaseSong, index: number) => {
              return toAMCardData(val, index);
            })
          );
        }
      }

      newItems.sort((a, b) => {
        if (a.searchIndex < b.searchIndex) return -1;
        else if (a.searchIndex == b.searchIndex) return 0;
        else return 1;
      });

      setItems(newItems);
    }
  };

  const searchItems = useCallback(async (term: string) => {
    const result = await axios.get("/api/v1/am/search", { params: { term: term } });
    return result.data;
  }, []);

  useEffect(() => {
    const timeOutId = setTimeout(() => handleSearch(searchTerm), 500);
    return () => clearTimeout(timeOutId);
  }, [searchTerm]);

  return (
    <main className="flex flex-col items-start justify-start p-8">
      <div className="flex flex-row w-full items-start gap-4">
        <Input
          autoFocus={true}
          onKeyDown={onKeyDown}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="url, albums, songs..."
          id="url"
        />
        <Button
          variant="outline"
          type="submit"
          onClick={(_) => handleSearch(searchTerm)}
        >
          Search
        </Button>
      </div>
      <div className="dark:scheme-dark max-h-[70vh] overflow-y-auto min-w-0 w-full my-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 -top-128 -mb-128">
          {items.map((item, index) => {
            return (
              <div key={index} className="flex flex-col rounded-lg border">
                <div className="flex flex-row gap-4 items-center p-2">
                  <div className="w-32 h-32 shrink-0 p-2">
                    <img
                      className="left-0 top-0 w-full h-full object-cover object-center transition duration-50 rounded-lg"
                      loading="lazy"
                      src={item.image}
                    ></img>
                  </div>
                  <div className="flex flex-col gap-2">
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription>{item.shortLabel}</CardDescription>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute flex flex-row gap-2 bottom-2 right-2">
                    {discordEnabled && enabledItemTypes.includes(item.type) && (
                      <Button
                        className="size-8"
                        variant="secondary"
                        size="icon"
                        onClick={async (_) => {
                          await axios.put(
                            "/api/v1/discord/queue",
                            { url: item.url },
                            { headers }
                          );
                          setItems((oldItems) => {
                            oldItems[index].discordAdded = true;
                            return oldItems;
                          });
                        }}
                      >
                        <SiDiscord></SiDiscord>
                      </Button>
                    )}
                    <Button
                      className="size-8"
                      variant="secondary"
                      size="icon"
                      onClick={async (_) => {
                        const { status } = await submitJob(item.url);

                        setItems((oldItems) => {
                          if (status === 200) {
                            oldItems[index].downloadState = "ok";
                          } else {
                            oldItems[index].downloadState = "failed";
                          }
                          return oldItems;
                        });
                      }}
                    >
                      {(() => {
                        if (item.downloadState == "ok") {
                          return <CheckIcon />;
                        } else if (item.downloadState == "notDownloaded") {
                          return <DownloadIcon />;
                        } else if (item.downloadState == "failed") {
                          return <XIcon />;
                        }
                      })()}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
