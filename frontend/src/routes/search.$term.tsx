import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { hasNextPage } from "@/lib/apple-music";

import { $api } from "@/lib/api";
import { SearchTabs } from "@/components/search-tabs";
import { components } from "@/openapi-schema";
import { SongCard } from "@/components/song-card";
import { AlbumCard } from "@/components/album-card";
import { ArtistCard } from "@/components/artist-card";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Route = createFileRoute("/search/$term")({
  component: Search,
});

function Search() {
  const navigate = useNavigate({ from: "/search/$term/albums" });
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
        return hasNextPage(lastPage) ? lastPage.offset + 25 : null;
      },
      initialPageParam: 0,
      pageParamName: "offset",
    }
  );

  return (
    <div className="flex flex-col items-start justify-start grow-1 p-8 gap-4 max-w-screen min-w-0">
      <SearchTabs />
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">
        Songs
      </h1>
      <div className="dark:scheme-dark grid grid-auto-cols grid-flow-col grid-rows-2 max-h-[30vh] w-full overflow-x-scroll gap-4 p-4">
        {useSearchQuery.isSuccess &&
          useSearchQuery.data.pages[0].songs?.data.map((item, index) => (
            <SongCard item={item} key={index} />
          ))}
      </div>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">
        Albums
      </h1>
      <div className="dark:scheme-dark flex flex-row w-full overflow-hidden gap-4 p-4">
        {useSearchQuery.isSuccess &&
          useSearchQuery.data.pages[0].albums?.data.map((item, index) => (
            <AlbumCard
              navigate={navigate}
              item={item}
              key={index}
            />
          ))}
      </div>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">
        Artists
      </h1>
      <div className="dark:scheme-dark flex flex-row w-full overflow-hidden gap-4 p-4">
        {useSearchQuery.isSuccess &&
          useSearchQuery.data.pages[0].artists?.data.map((item, index) => (
            <ArtistCard
              navigate={navigate}
              item={item}
              key={index}
            />
          ))}
      </div>
    </div>
  );
}
