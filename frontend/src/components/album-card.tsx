import { UseNavigateResult } from "@tanstack/react-router";

import { AMItem, amGetImage, amGetShortLabel } from "@/lib/apple-music";
import { cn } from "@/lib/utils";
import { CardTitle, CardDescription } from "./ui/card";

interface AlbumCardProps {
  item: AMItem;
  navigate: UseNavigateResult<string>;
  className?: string;
}

export function AlbumCard({ item, navigate, className }: AlbumCardProps) {
  return (
    item.attributes && (
      <div className={cn(className, "flex flex-col rounded-lg hover:bg-accent hover:cursor-pointer")}>
        <div
          className="flex flex-col gap-4 items-start p-2"
          onClick={() => {
            navigate({
              to: "/album/$albumId",
              params: { albumId: item.id },
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
            <CardTitle>{item.attributes.name}</CardTitle>
            <CardDescription>{amGetShortLabel(item)}</CardDescription>
          </div>
        </div>
      </div>
    )
  );
}
