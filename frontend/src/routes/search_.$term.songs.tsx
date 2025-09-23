import { useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { amGetImage } from "@/lib/apple-music";

import { $api, PAGESIZE } from "@/lib/api";
import {AddToDiscord} from "@/components/add-to-discord";
import { DownloadButton } from "@/components/download-button";
import { components } from "@/openapi-schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { millisToStr } from "@/lib/utils";
import { SearchTabs } from "@/components/search-tabs";

export const Route = createFileRoute("/search_/$term/songs")({
  component: RouteComponent,
});

function RouteComponent() {
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
        return lastPage.songs?.next ? lastPage.offset + PAGESIZE : null;
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
      {useSearchQuery.isSuccess && useSearchQuery.data.pages[0].songs ? (
        <>
          <div
            ref={scrollRef}
            className="dark:scheme-dark overflow-y-auto grow-1 w-full my-[2vh]"
          >
            <div className="dark:scheme-dark flex flex-col items-center justify-center w-full max-h-[70vh] h-fit">
              <Table className="mx-auto">
                <TableHeader className="sticky top-0 z-[10] z-10 bg-background shadow-sm">
                  <TableRow>
                    <TableHead className="w-[100px]"></TableHead>
                    <TableHead>TITLE</TableHead>
                    <TableHead>DURATION</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="flex-1 overflow-auto">
                  {useSearchQuery.data.pages.flatMap((group, i) =>
                    group.songs?.data.map(
                      (item, index) =>
                        item.attributes && (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium text-muted-foreground">
                              {i * PAGESIZE + index + 1}
                            </TableCell>
                            <TableCell className="w-full">
                              <div className="flex flex-row gap-4 items-center">
                                <div className="w-8 h-8 shrink-0">
                                  <img
                                    className="left-0 top-0 w-full h-full object-cover object-center transition duration-50 rounded-lg"
                                    loading="lazy"
                                    src={amGetImage(item)}
                                  ></img>
                                </div>
                                <div className="flex flex-col">
                                  <p>{item.attributes.name}</p>
                                  <p className="text-muted-foreground">
                                    {item.attributes.artistName}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {item.attributes.durationInMillis
                                ? millisToStr(item.attributes.durationInMillis)
                                : ""}
                            </TableCell>
                            <TableCell className="flex flex-row gap-2 items-end justify-end">
                              <AddToDiscord
                                url={item.attributes.url}
                                type={item.type}
                              />
                              <DownloadButton url={item.attributes.url} />
                            </TableCell>
                          </TableRow>
                        )
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <Button
            variant="outline"
            type="submit"
            onClick={() => useSearchQuery.fetchNextPage()}
            disabled={!useSearchQuery.hasNextPage || useSearchQuery.isFetching}
            className="flex flex-row items-end justify-end self-end"
          >
            {useSearchQuery.isFetchingNextPage
              ? "Loading more..."
              : useSearchQuery.hasNextPage
              ? "Load More"
              : "Nothing more to load"}
          </Button>
        </>
      ) : (
        <>
          <p className="text-muted-foreground">No songs found</p>
        </>
      )}
    </div>
  );
}
