from typing import Any, Sequence
from fastapi import APIRouter, HTTPException

from ...apple_music.downloader import AM_ITEM_TYPES, create_apple_music, create_apple_music
from ...apple_music.models import AMAlbum, AMArtist, AMPlaylist, AMSearchResp

apple_music = create_apple_music()
router = APIRouter(prefix="/am")

@router.get("/search", response_model=AMSearchResp)
async def search(term: str, offset: int = 0, types: Sequence[AM_ITEM_TYPES] = ["songs", "albums", "artists", "playlists"]) -> dict[str, Any]:
    if not term:
        return {}
    resp = await apple_music.get_search_results(term, types=",".join(types), offset=offset)
    results: dict[Any, Any] | None = resp.get("results")
    offset_dict = {"offset": offset}
    if results:
        results.update(offset_dict)
        return results 
    return offset_dict

@router.get("/album", response_model=AMAlbum)
async def album(id: str) -> Any:
    resp = await apple_music.get_album(id)
    if not resp:
        raise HTTPException(404, detail="album not found")

    album = resp.get("data")
    if not album:
        raise HTTPException(404, detail="album data error")

    return album[0]

@router.get("/artist", response_model=AMArtist)
async def artist(id: str, limit: int = 20) -> Any:
    resp = await apple_music.get_artist(id, limit=limit)
    if not resp:
        raise HTTPException(404, detail="artist not found")
    
    artist = resp.get("data") 
    if not artist:
        raise HTTPException(404, detail="artist data error")

    return artist[0]

@router.get("/playlist", response_model=AMPlaylist)
async def playlist(id: str, limit_tracks: int = 300) -> Any:
    resp = await apple_music.get_playlist(id, limit_tracks=limit_tracks)
    if not resp:
        raise HTTPException(404, detail="playlist not found")

    playlist = resp.get("data") 
    if not playlist:
        raise HTTPException(404, detail="playlist data error")

    return playlist[0]
