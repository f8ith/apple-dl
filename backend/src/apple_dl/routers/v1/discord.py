import asyncio
from contextlib import asynccontextmanager
from typing import List

from apple_dl.schemas.discord_schemas import PlayerStateSchema, SongSchema
from fastapi import FastAPI, APIRouter, Request, Header, HTTPException, Depends
from pydantic import BaseModel

from apple_dl.config import cfg
from apple_dl.discord_bot import bot, run_bot
from apple_dl.discord_bot.player import DiscordPlayerState, Song
from apple_dl.jobs import create_job_task

@asynccontextmanager
async def lifespan(app: FastAPI):
    await run_bot()
    yield

alt_router = APIRouter()

class ValidPlayerStateResp(BaseModel):
    valid: bool

@alt_router.get("/check_state")
async def check_state(player_id: str = Header()) -> ValidPlayerStateResp:
    if player_id == "":
        return ValidPlayerStateResp(valid=False)

    player = player_manager.by_id(player_id)
    if not player:
        return ValidPlayerStateResp(valid=False)
    else:
        return ValidPlayerStateResp(valid=True)


async def before_request(request: Request, player_id: str = Header()):
    player = player_manager.by_id(player_id)
    if not player:
       raise HTTPException(status_code=400, detail="invalid player_id")

    request.state.player = player

_router = APIRouter(dependencies=[Depends(before_request)])

player_manager = bot.player_manager

@_router.get("/player_state")
async def player_state(request: Request) -> PlayerStateSchema:
    player: DiscordPlayerState = request.state.player
    return player.__pydantic__()


@_router.put("/play_pause")
async def play_pause(request: Request):
    await player_manager.play_pause(request.state.player)
    return {}


@_router.put("/resume")
async def resume(request: Request):
    await player_manager.resume(request.state.player)
    return {}


@_router.put("/pause")
async def pause(request: Request):
    await player_manager.pause(request.state.player)
    return {}

@_router.put("/loop")
async def loop(request: Request):
    await player_manager.enable_loop(request.state.player)
    return {}

@_router.put("/repeat")
async def repeat(request: Request):
    await player_manager.enable_repeat(request.state.player)
    return {}

class VolumeReq(BaseModel):
    volume: float 

@_router.put("/volume")
async def volume(request: Request, volume: VolumeReq):
    await player_manager.set_volume(request.state.player, volume.volume)
    return {}


class SeekReq(BaseModel):
    seek_time: int

@_router.put("/seek")
async def seek(request: Request, seek: SeekReq):
    await player_manager.seek(request.state.player, seek.seek_time)
    return {}

class SongReq(BaseModel):
    id: int 

@_router.put("/play_next")
async def play_next(request: Request, song: SongReq):
    await player_manager.play_next(request.state.player, song.id)
    return {}

@_router.put("/play_later")
async def play_later(request: Request, song: SongReq):
    await player_manager.play_later(request.state.player, song.id)
    return {}

@_router.delete("/remove_song")
async def remove_song(request: Request, song: SongReq):
    await player_manager.remove_song(request.state.player, song.id)
    return {}

@_router.put("/skip")
async def skip (request: Request):
    await player_manager.skip(request.state.player)
    return {}

@_router.put("/disconnect")
async def disconnect(request: Request):
    await player_manager.disconnect_player(request.state.player)
    return {}

@_router.get("/queue")
async def get_queue(request: Request) -> List[SongSchema]:
    return [x.__pydantic__() for x in request.state.player.queue]

class JobReq(BaseModel):
    url: str

@_router.put("/queue")
async def post_queue(request: Request, job_req: JobReq):
    if not job_req.url.startswith("http"):
        raise HTTPException(detail="bad url", status_code=400)

    job = await create_job_task(job_req.url, cfg.MUSIC_DIR)

    # TODO do not wait for whole album?
    await asyncio.wait_for(job.job_completed.wait(), 120)

    if isinstance(job.job_result, Exception) or not job.job_result:
        raise HTTPException(detail="unable to download song", status_code=500)
    else:
        for result in job.job_result:
            song = Song(result)
            player_manager.add_song(request.state.player, song)
            return {}


router = APIRouter(prefix="/discord", lifespan=lifespan)
router.include_router(_router)
router.include_router(alt_router)