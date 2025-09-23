import {  useEffect, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import { SearchTabs } from "@/components/search-tabs";
import { components } from "@/openapi-schema";
import { $api, PAGESIZE } from "@/lib/api";
import { AlbumCard } from "@/components/album-card";

export const Route = createFileRoute("/search_/$term/albums")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({ from: "/search/$term/albums" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const { term } = Route.useParams();

  const useSearchQuery = $api.useInfiniteQuery(
    "get",
    "/api/v1/am/search",
    {
      params: { query: { term: term } },
    },
    {
      getNextPageParam: (lastPage: components["schemas"]["AMSearchResp"]) => {
        if (lastPage.offset == null || lastPage.offset == undefined)
          return null;
        return lastPage.albums?.next ? lastPage.offset + 25 : null;
      },
      initialPageParam: 0,
      pageParamName: "offset",
    }
  );

  useEffect(() => {
    if (useSearchQuery.isSuccess && useSearchQuery.data) {
      if (scrollRef.current && useSearchQuery.data.pages.length <= 1) {
        scrollRef.current.scrollTop = 0;
      }
    }
  }, [useSearchQuery.isSuccess, useSearchQuery.data]);

  if (useSearchQuery.isPending)
    return (
      <div className="flex flex-col items-start justify-start grow-1 p-8">
        <SearchTabs />
      </div>
    );

  return (
    <div className="flex flex-col items-start justify-start grow-1 p-8">
      <SearchTabs />
      {useSearchQuery.isSuccess ? (
        useSearchQuery.data.pages[0].albums && (
          <>
            <div
              ref={scrollRef}
              className="dark:scheme-dark max-h-[68vh] overflow-y-auto grow-1 w-full my-[2vh]"
            >
              <div className="grid grid-cols-2 md:grid-cols-l lg:grid-cols-8 gap-4 p-4">
                {useSearchQuery.data.pages.flatMap((group, i) =>
                  group.albums?.data.map((item, index) => (
                    <AlbumCard item={item} navigate={navigate} key={i * PAGESIZE + index} />
                  ))
                )}
              </div>
            </div>

            <Button
              variant="outline"
              type="submit"
              onClick={() => useSearchQuery.fetchNextPage()}
              disabled={
                !useSearchQuery.hasNextPage || useSearchQuery.isFetching
              }
              className="flex flex-row items-end justify-end self-end"
            >
              {useSearchQuery.isFetchingNextPage
                ? "Loading more..."
                : useSearchQuery.hasNextPage
                ? "Load More"
                : "Nothing more to load"}
            </Button>
          </>
        )
      ) : (
        <>
          <p className="text-muted-foreground">No albums found</p>
        </>
      )}
    </div>
  );
}
