import { useDebounceValue, useSessionStorage } from "usehooks-ts";

import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AMCardData,
  hasNextPage,
  itemTypes,
  TBaseItem,
  toAMCardData,
} from "@/lib/apple-music";

import { CheckIcon, DownloadIcon, XIcon } from "lucide-react";
import { SiDiscord } from "@icons-pack/react-simple-icons";
import { useJobs } from "@/hooks/use-jobs";
import { useDiscord } from "@/hooks/use-discord";
import { $api } from "@/lib/api";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/search")({
  component: Search,
});

function Search() {
  const [searchText, setSearchText] = useSessionStorage<string>("searchText", "");
  const [debouncedTerm, setDebouncedTerm] = useDebounceValue(searchText, 500);
  const { useSubmitJob } = useJobs();
  const [items, setItems] = useSessionStorage<AMCardData[]>("searchItems", []);
  const {
    header,
    discordEnabled,
    discordEnabledItemTypes: enabledItemTypes,
    useQueueMutation,
  } = useDiscord();

  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSearch = (data: InfiniteData<any, any>) => {
    console.log(data);
    setItems([]);
    const newItems: AMCardData[] = [];

    for (const page of data.pages) {
      for (const itemType of itemTypes) {
        if (page[itemType]) {
          newItems.push(
            ...page[itemType].data.map((val: TBaseItem, index: number) => {
              return toAMCardData(val, index);
            })
          );
        }
      }
    }

    newItems.sort((a, b) => {
      if (a.searchIndex < b.searchIndex) return -1;
      else if (a.searchIndex == b.searchIndex) return 0;
      else return 1;
    });

    if (scrollRef.current && data.pages.length <= 1) {
      scrollRef.current.scrollTop = 0;
    }

    setItems(newItems);
  };

  const useSearchQuery = $api.useInfiniteQuery(
    "get",
    "/api/v1/am/search",
    {
      params: { query: { term: debouncedTerm } },
    },
    {
      getNextPageParam: (lastPage: any) => {
        return hasNextPage(lastPage) ? lastPage.offset + 25 : null;
      },
      initialPageParam: 0,
      pageParamName: "offset",
    }
  );

  useEffect(() => {
    if (useSearchQuery.isSuccess && useSearchQuery.data) {
      handleSearch(useSearchQuery.data);
    }
  }, [useSearchQuery.isSuccess, useSearchQuery.data]);

  //TODO width broken
  return (
    <main className="flex flex-col items-start justify-start grow-1 p-8">
      <div className="flex flex-row container items-start gap-4 px-8">
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
      <div
        ref={scrollRef}
        className="dark:scheme-dark max-h-[70vh] overflow-y-auto grow-1 w-full my-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {items.map((item, index) => {
            return (
              <div key={index} className="flex flex-col rounded-lg border">
                <Link disabled={item.type != "albums"} key={index} to={`/album/$albumId`} params={{albumId: item.id.toString()}}>
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
                </Link>
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
      {items.length > 0 && <Button
        variant="outline"
        type="submit"
        onClick={() => useSearchQuery.fetchNextPage()}
        disabled={!hasNextPage || useSearchQuery.isFetching}
        className="flex flex-row items-end justify-end self-end"
      >
        {useSearchQuery.isFetchingNextPage
          ? "Loading more..."
          : useSearchQuery.hasNextPage
          ? "Load More"
          : "Nothing more to load"}
      </Button>}
    </main>
  );
}
