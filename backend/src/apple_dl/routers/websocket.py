from typing import Any, Callable, Sequence, cast

import socketio

from ..config import cfg
from ..logger import logger


old_on = socketio.AsyncServer.on


# Gets rid of the type error in the decorator
class TypedAsyncServer(socketio.AsyncServer):
    def on(self, event: str, namespace: str | None = None) -> Callable:  # type: ignore
        ...


sio: TypedAsyncServer = cast(
    TypedAsyncServer,
    socketio.AsyncServer(
        async_mode="asgi",
        logger=False,
        engineio_logger=False,
        cors_allowed_origins=cfg.ALLOW_ORIGINS,
    ),
)

async def notify_job_done(_: int) -> None:
    logger.debug("gamdl job done")
    await sio.emit("status_update")

async def player_state_changed(player_id: str, data: dict[str, Any]) -> None:
    logger.debug(f"player state changed, emitting updates to {player_id}")
    await sio.emit("player_state_changed", data, to=player_id)

async def player_queue_changed(player_id: str, data: Sequence[dict[str, Any]]) -> None:
    logger.debug(f"player queue changed, emitting updates to {player_id}")
    await sio.emit("player_queue_changed", data, to=player_id)

@sio.on("register_player_id")
async def register_player_id(sid, data):
    player_id = data.get("player-id")
    if not player_id:
        return

    logger.debug(f"adding {sid} to room {player_id}")
    await sio.enter_room(sid, player_id)

def get_asgi_app():
    return socketio.ASGIApp(
        sio,
        socketio_path="/socket.io",
    )
