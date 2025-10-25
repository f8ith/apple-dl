import { UseNavigateResult } from "@tanstack/react-router";

import { AMItem, amGetImage } from "@/lib/apple-music";
import { cn } from "@/lib/utils";
import { CardTitle, CardDescription } from "./ui/card";
import { components } from "@/openapi-schema";

interface AlbumCardProps {
  item: AMItem;
  navigate: UseNavigateResult<string>;
  className?: string;
}

export function PlaylistCard({ item, navigate, className }: AlbumCardProps) {
  const playlistItem = item as components["schemas"]["AMPlaylist"];
  return (
    item.attributes && (
      <div className={cn("max-w-xs min-w-3xs flex flex-col rounded-lg hover:bg-accent hover:cursor-pointer", className)}>
        <div
          className="flex flex-col gap-4 items-start p-2"
          onClick={() => {
            navigate({
              to: "/playlist/$playlistId",
              params: { playlistId: item.id },
            });
          }}
        >
          <div className="w-full shrink-0">
            <img
              className="left-0 top-0 w-full h-full object-cover object-center transition duration-50 rounded-lg"
              loading="lazy"
              src={amGetImage(item)}
            ></img>
          </div>
          <div className="flex flex-col gap-2">
            <CardTitle className="line-clamp-2">{item.attributes.name}</CardTitle>
            <CardDescription>{playlistItem.attributes.curatorName}</CardDescription>
          </div>
        </div>
      </div>
    )
  );
}
