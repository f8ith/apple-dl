from contextlib import asynccontextmanager

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

async def before_request(request: Request, player_id: str = Header(), guild_id: str = Header()):
    guild_id_int = int(guild_id)

    player = player_manager.by_guild(guild_id_int)
    if not player:
        raise HTTPException(status_code=400, detail="invalid guild_id")
    if player.player_id != player_id:
        raise HTTPException(status_code=400, detail="invalid player_id")

    request.state.player = player

router = APIRouter(prefix="/discord", lifespan=lifespan, dependencies=[Depends(before_request)])

player_manager = bot.player_manager

# TODO: schema all responses and requests

@router.get("/player_state")
async def player_state(request: Request):
    player: DiscordPlayerState = request.state.player
    return player.__pydantic__()


@router.put("/play_pause")
async def play_pause(request: Request):
    await player_manager.play_pause(request.state.player)
    return {}


@router.put("/resume")
async def resume(request: Request):
    await player_manager.resume(request.state.player)
    return {}


@router.put("/pause")
async def pause(request: Request):
    await player_manager.pause(request.state.player)
    return {}


class VolumeReq(BaseModel):
    volume: float 

@router.put("/volume")
async def volume(request: Request, volume: VolumeReq):
    await player_manager.set_volume(request.state.player, volume.volume)
    return {}


class SeekReq(BaseModel):
    seek_time: int

@router.put("/seek")
async def seek(request: Request, seek: SeekReq):
    await player_manager.seek(request.state.player, seek.seek_time)
    return {}

class SongReq(BaseModel):
    id: int 

@router.put("/play_next")
async def play_next(request: Request, song: SongReq):
    player_manager.play_next(request.state.player, song.id)
    return {}

@router.put("/skip")
async def skip (request: Request):
    await player_manager.skip(request.state.player)
    return {}


@router.put("/disconnect")
async def disconnect(request: Request):
    await player_manager.disconnect_player(request.state.player)
    return {}

@router.get("/queue")
async def get_queue(request: Request):
    return [x.__pydantic__() for x in request.state.player.queue]

class JobReq(BaseModel):
    url: str

@router.put("/queue")
async def post_queue(request: Request, job_req: JobReq):
    if not job_req.url.startswith("http"):
        raise HTTPException(detail="bad url", status_code=400)

    job = await create_job_task(job_req.url, cfg.MUSIC_DIR)
    song = Song(job)

    player_manager.add_song(request.state.player, song)
    return {}

"""
@discord_bp.before_request
def make_session_permanent():
    session.permanent = True
    if not session["discord_id"]:
        return redirect(
            f"https://discord.com/oauth2/authorize?client_id={config.DISCORD_CLIENT_ID}&response_type=code&redirect_uri={config.SERVER_URL}&scope=identify+guilds",
            code=302,
        )

@discord_bp.route("/callback")
async def callback(code: str):
    if not code:
        return "missing code", 400

    async with aiohttp.ClientSession() as cs:
        resp = await cs.post(
            "https://discord.com/api/oauth2/token",
            params={
                "client_id": config.DISCORD_CLIENT_ID,
                "client_secret": config.DISCORD_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": config.SERVER_URL + "/discord/callback",
                "scope": "identify",
            },
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
            },
        )
        oauth_data = await resp.json()
        user_resp = await cs.get(
            "https://discord.com/api/users/@me",
            headers={
                "authorization": f"{oauth_data["token_type"]} {oauth_data["access_token"]}",
            },
        )

    user_resp_data = await user_resp.json()
    session["discord_id"] = user_resp_data["id"]
    return redirect("/", code=302)
"""
