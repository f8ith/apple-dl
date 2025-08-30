from fastapi import APIRouter

from ...apple_music_api import apple_music

router = APIRouter(prefix="/am")


@router.get("/search")
async def search(term: str):
    if not term:
        return {}
    return apple_music.search(term)



