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

export interface AMCardData {
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

export function getOrDefaultImage(item: components["schemas"]["SongSchema"]) {
  return item.image != ""
    ? item.image.replace("{w}", "720").replace("{h}", "480")
    : UNKNOWN_RECORD_IMAGE;
}

export function getShortLabel(val: components["schemas"]["SongSchema"]) {
  return `${val.artist_name} • ${
    val.album_name
  }`;
}

export function toAMCardData(val: TBaseItem, index: number = 0): AMCardData {
  const attributes = val.attributes;
  return {
    name: attributes.name,
    artistName: attributes.artistName,
    albumName: attributes.albumName,
    shortLabel: `${val.type} • ${
      attributes.artistName ? attributes.artistName : attributes.name
    }`,
    image: attributes.artwork
      ? attributes.artwork.url.replace("{w}", 720).replace("{h}", 480)
      : UNKNOWN_RECORD_IMAGE,
    url: attributes.url,
    downloadState: "notDownloaded",
    discordAdded: false,
    searchIndex: index,
    type: val.type,
    length: val.attributes.durationInMillis,
  };
}
