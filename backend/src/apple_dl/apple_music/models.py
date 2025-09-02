from typing import List
from pydantic import BaseModel


class AMArtwork(BaseModel):
    bgColor: str
    hasP3: bool
    height: int
    textColor1: str
    textColor2: str
    textColor3: str
    textColor4: str
    url: str
    width: int


class PlayParams(BaseModel):
    id: str = ""
    kind: str = ""
    versionHash: str = ""


class AMContentVersion(BaseModel):
    MZ_INDEXER: int
    RTCI: int


class AMAlbumAttributes(BaseModel):
    artistName: str
    artwork: AMArtwork | None = None
    audioTraits: List[str] = []
    copyright: str = ""
    genreNames: List[str] = []
    isCompilation: bool
    isComplete: bool
    isMasteredForItunes: bool
    isPrerelease: bool = False
    isSingle: bool = False
    name: str
    playParams: PlayParams
    recordLabel: str = ""
    releaseDate: str
    trackCount: int
    upc: str = ""
    url: str


class AMArtistAttributes(BaseModel):
    artwork: AMArtwork | None = None
    genreNames: List[str] = []
    name: str
    url: str


class AMArtist(BaseModel):
    id: str = ""
    type: str = ""
    href: str
    attributes: AMArtistAttributes | None = None
    relationships: "AMArtistRelationships | None" = None


class AMArtists(BaseModel):
    href: str
    next: str | None = None
    data: List[AMArtist] = []


class ExtendedAssetUrls(BaseModel):
    enhancedHls: str
    lightweight: str
    lightweightPlus: str
    plus: str
    superLightweight: str


class Preview(BaseModel):
    url: str


class AMSongAttributes(BaseModel):
    albumName: str = ""
    artistName: str = ""
    artwork: AMArtwork | None = None
    audioLocale: str = ""
    audioTraits: List[str] = []
    composerName: str = ""
    discNumber: int = 0
    durationInMillis: int
    extendedAssetUrls: ExtendedAssetUrls | None = None
    genreNames: List[str]
    hasLyrics: bool
    hasTimeSyncedLyrics: bool
    isAppleDigitalMaster: bool
    isMasteredForItunes: bool
    isVocalAttenuationAllowed: bool
    isrc: str = ""
    name: str
    playParams: PlayParams
    previews: List[Preview] = []
    releaseDate: str = ""
    trackNumber: int = 0
    url: str


class AMSong(BaseModel):
    id: str = ""
    type: str = ""
    href: str
    attributes: AMSongAttributes


class AMSongs(BaseModel):
    href: str
    next: str = ""
    data: List[AMSong] = []


class AMRelationships(BaseModel):
    artists: AMArtists
    tracks: AMSongs


class AMAlbum(BaseModel):
    id: str = ""
    type: str = ""
    href: str
    attributes: AMAlbumAttributes | None = None
    relationships: AMRelationships | None = None


class EditorialNotes(BaseModel):
    name: str = ""
    short: str = ""
    standard: str = ""


class ContentVersion(BaseModel):
    MZ_INDEXER: int
    RTCI: int


class AMAlbums(BaseModel):
    href: str
    next: str | None = None
    data: List[AMAlbum] = []


class AMArtistRelationships(BaseModel):
    albums: AMAlbum


class Description(BaseModel):
    standard: str = ""


class AMPlaylistAttributes(BaseModel):
    artwork: AMArtwork | None = None
    audioTraits: List[str] = []
    curatorName: str
    description: Description | None = None
    editorialNotes: EditorialNotes | None = None
    editorialPlaylistKind: str = ""
    hasCollaboration: bool
    isChart: bool
    lastModifiedDate: str = ""
    name: str
    playParams: PlayParams 
    playlistType: str = ""
    supportsSing: bool = False
    url: str


class AMPlaylist(BaseModel):
    id: str = ""
    type: str = ""
    href: str
    attributes: AMPlaylistAttributes


class AMPlaylists(BaseModel):
    href: str
    next: str | None = None
    data: List[AMPlaylist] = []


class AMSearchResp(BaseModel):
    albums: AMAlbums | None = None
    artists: AMArtists | None = None
    playlists: AMPlaylists | None = None
    songs: AMSongs | None = None
    offset: int | None = None
