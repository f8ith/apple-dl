from typing import Any, Sequence
from fastapi import APIRouter, HTTPException

from ...apple_music.downloader import AM_ITEM_TYPES, apple_music
from ...apple_music.models import AMAlbum, AMSearchResp

router = APIRouter(prefix="/am")

@router.get("/search", response_model=AMSearchResp)
async def search(term: str, offset: int = 0, types: Sequence[AM_ITEM_TYPES] = ["songs", "albums", "artists", "playlists"]) -> dict[str, Any]:
    if not term:
        return {}
    search = apple_music.search(term, types=",".join(types), offset=offset)
    offset_dict = {"offset": offset}
    if search:
        search.update(offset_dict)
        return search
    return offset_dict

@router.get("/album", response_model=AMAlbum)
async def album(id: str) -> Any:
    search = apple_music.get_album(id)
    if not search:
        raise HTTPException(404, detail="album not found")
    return search
