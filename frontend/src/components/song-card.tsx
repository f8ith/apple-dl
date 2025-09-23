import { AMItem, amGetImage, amGetShortLabel } from "@/lib/apple-music";
import {AddToDiscord} from "./add-to-discord";
import { DownloadButton } from "./download-button";
import { CardTitle, CardDescription } from "./ui/card";
import { cn } from "@/lib/utils";

interface SongCardProps {
  item: AMItem;
  className?: string;
}

export function SongCard({ item, className }: SongCardProps) {
  return (
    item.attributes && (
      <div className={cn(className, "flex flex-col rounded-lg border hover:bg-accent min-w-sm")}>
        <div className="flex flex-row gap-4 items-center p-2">
          <div className="w-32 h-32 shrink-0 p-2">
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
        <div className="relative">
          <div className="absolute flex flex-row gap-2 bottom-2 right-2">
            <AddToDiscord type={item.type} url={item.attributes.url} />
            <DownloadButton url={item.attributes.url} />
          </div>
        </div>
      </div>
    )
  );
}
