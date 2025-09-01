import { useDebounceValue } from "usehooks-ts";

import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AMCardData,
  itemTypes,
  TBaseItem,
  toAMCardData,
} from "@/lib/apple-music";

import { CheckIcon, DownloadIcon, XIcon } from "lucide-react";
import { SiDiscord } from "@icons-pack/react-simple-icons";
import { useJobs } from "@/hooks/use-jobs";
import { usePersistState } from "@/hooks/use-persist-state";
import { useDiscord } from "@/hooks/use-discord";
import { $api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";


export const Route = createFileRoute("/search")({
  component: Search,
});

function Search() {
  const [searchText, setSearchText] = usePersistState<string>("searchText", "");
  const [debouncedTerm, setDebouncedTerm] = useDebounceValue(searchText, 500);
  const { useSubmitJob } = useJobs();
  const [items, setItems] = usePersistState<AMCardData[]>("searchItems", []);
  const { header, discordEnabled, enabledItemTypes, useQueueMutation } =
    useDiscord();

const queryClient = useQueryClient();


  const handleSearch = (data: any) => {
    setItems([])
    const newItems: AMCardData[] = [];

    for (const itemType of itemTypes) {
      if (data[itemType]) {
        newItems.push(
          ...data[itemType].data.map((val: TBaseItem, index: number) => {
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

    console.log(newItems)
    setItems(newItems);
  };

  const useSearchQuery = $api.useQuery("get", "/api/v1/am/search", {
    params: { query: { term: debouncedTerm } },
  });


  useEffect(() => {
    if (useSearchQuery.isSuccess && useSearchQuery.data) {
      handleSearch(useSearchQuery.data);
    }
    }, [useSearchQuery.isSuccess, useSearchQuery.data]);


  //TODO width broken
  return (
    <main className="flex flex-col items-start justify-start grow-1 p-8">
      <div className="flex flex-row items-start gap-4">
        <Input
          autoFocus={true}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setDebouncedTerm(e.target.value);
          }}
          placeholder="url, albums, songs..."
          id="url"
        />
        <Button
          variant="outline"
          type="submit"
          onClick={(_) =>
            queryClient.invalidateQueries({
              queryKey: [
                "get",
                "/api/v1/am/search",
                { params: { query: { term: debouncedTerm } } },
              ],
            })
          }
        >
          Search
        </Button>
      </div>
      <div className="dark:scheme-dark max-h-[70vh] overflow-y-auto grow-1 w-full my-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
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
                          await useQueueMutation.mutate({
                            body: { url: item.url },
                            params: { header },
                          });
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
                        await useSubmitJob.mutateAsync({
                          body: { url: item.url },
                        });

                        setItems((oldItems) => {
                          if (useSubmitJob.status) {
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
