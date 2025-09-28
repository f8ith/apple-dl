import { UseNavigateResult } from "@tanstack/react-router";

import { AMItem, amGetImage, amGetShortLabel } from "@/lib/apple-music";
import { CardTitle, CardDescription } from "./ui/card";
import { cn } from "@/lib/utils";

interface ArtistCardProps {
  item: AMItem;
  navigate: UseNavigateResult<string>;
  className?: string;
}

export function ArtistCard({ item, navigate, className }: ArtistCardProps) {
  return (
    item.attributes && (
      <div className={cn("max-w-xs min-w-3xs flex flex-col rounded-lg hover:bg-accent hover:cursor-pointer", className)}>
        <div
          className="flex flex-col gap-4 items-start p-2"
          onClick={() => {
            // TODO: Fix artist link
            navigate({
              to: "/artist/$artistId",
              params: { artistId: item.id },
            });
          }}
        >
          <div className="w-full shrink-0">
            <img
              className="left-0 top-0 w-full h-full object-cover object-center transition duration-50 rounded-full"
              loading="lazy"
              src={amGetImage(item)}
            ></img>
          </div>
          <div className="flex flex-col gap-2">
            <CardTitle className="line-clamp-2">{item.attributes.name}</CardTitle>
            <CardDescription>{amGetShortLabel(item)}</CardDescription>
          </div>
        </div>
      </div>
    )
  );
}
