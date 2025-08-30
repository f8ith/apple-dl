from attr import define
import attr
from quart import Blueprint, request
from quart_schema import validate_request, validate_response

from apple_dl.config import cfg
from apple_dl.discord_bot import bot, run_bot
from apple_dl.discord_bot.player import Song
from apple_dl.jobs import create_job_task
from apple_dl.request_context import g
from apple_dl.schemas.discord_schemas import PlayerStateSchema

discord_bp = Blueprint("discord", __name__)

player_manager = bot.player_manager

# TODO: schema all responses and requests


@discord_bp.before_app_serving
async def init_bot():
    await run_bot()


@discord_bp.before_request
async def before_request():
    player_id = request.headers.get("player_id")
    guild_id = request.headers.get("guild_id")

    if not player_id:
        return "missing player_id", 400
    if not guild_id:
        return "missing guild_id", 400

    guild_id = int(guild_id)

    player = player_manager.by_guild(guild_id)
    if not player:
        return "invalid guild_id", 400
    if player.player_id != player_id:
        return "invalid player_id", 400

    g.player = player


@validate_response(PlayerStateSchema)
@discord_bp.route("/player_state", methods=["GET"])
async def player_state():
    new_state = PlayerStateSchema.from_player_state(g.player)
    return attr.asdict(new_state)


@discord_bp.route("/play_pause")
async def play_pause():
    await player_manager.play_pause(g.player)
    return {}


@discord_bp.route("/resume")
async def resume():
    await player_manager.resume(g.player)
    return {}


@discord_bp.route("/pause")
async def pause():
    await player_manager.pause(g.player)
    return {}


@define
class SongRequest:
    id: int


@discord_bp.route("/play_next", methods=["POST"])
@validate_request(SongRequest)
async def play_next(data: SongRequest):
    player_manager.play_next(g.player, data.id)
    return {}


@discord_bp.route("/disconnect")
async def disconnect():
    await player_manager.disconnect_player(g.player)
    return {}


@discord_bp.route("/queue", methods=["GET", "POST"])
async def queue():
    if request.method == "POST":
        data = await request.get_json()
        if not data:
            return {"errors": ["bad json"]}, 400

        url: str | None = data.get("url")

        if not (url and url.startswith("http")):
            return {"errors": ["bad url"]}, 400

        job = await create_job_task(url, cfg.MUSIC_DIR)
        song = Song(job)

        player_manager.add_song(g.player, song)
        return {}
    elif request.method == "GET":
        return [x.__json__() for x in g.player.queue]

    # Never
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
