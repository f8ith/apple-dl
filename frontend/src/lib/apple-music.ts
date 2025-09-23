import { UNKNOWN_RECORD_IMAGE } from "@/lib/utils";
import { components } from "@/openapi-schema";

export const itemTypes = ["songs", "albums", "playlists", "artists"];

export type TItemType = (typeof itemTypes)[number];

export type TDownloadState = "ok" | "notDownloaded" | "failed";

export interface TBaseItem {
  id: number;
  attributes: any;
  type: TItemType;
}

export type AMItem = components["schemas"]["AMSong"] | components["schemas"]["AMAlbum"] |
  components["schemas"]["AMPlaylist"] | components["schemas"]["AMArtist"];

export type AMAttributes = components["schemas"]["AMSong"]["attributes"] | components["schemas"]["AMAlbum"]["attributes"] |
  components["schemas"]["AMPlaylist"]["attributes"] | components["schemas"]["AMArtist"]["attributes"];

export interface AMCardData {
  id: number;
  name: string;
  artistName: string;
  albumName: string | null;
  shortLabel: string;
  image: string;
  url: string;
  downloadState: TDownloadState;
  discordAdded: boolean;
  searchIndex: number;
  type: TItemType;
  length: number;
}

export function getImage(item: components["schemas"]["SongSchema"]) {
  return item.image != ""
    ? item.image.replace("{w}", "720").replace("{h}", "480")
    : UNKNOWN_RECORD_IMAGE;
}

export function amGetImage(item: AMItem, width: number = 720, height: number = 480) {
  return item.attributes && item.attributes.artwork && item.attributes.artwork.url != ""
    ? item.attributes.artwork.url.replace("{w}", String(width)).replace("{h}", String(height)) 
    : UNKNOWN_RECORD_IMAGE;
}

export function getShortLabel(val: components["schemas"]["SongSchema"]) {
  return `${val.artist_name} • ${val.album_name}`;
}

export function amGetShortLabel(val: AMItem) {
  if (!val.attributes)
    return

  if ("artistName" in val.attributes)
    return `${val.type} • ${val.attributes.artistName}`;
  else
    return `${val.type} • ${val.attributes.name}`;
}

export function hasNextPage(val: any) {
  for (const type of itemTypes) {
    if (type in val) {
      if (val[type] && "next" in val[type]) return true;
    }
  }
  return false;
}
