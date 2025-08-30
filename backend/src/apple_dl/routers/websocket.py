from logging import getLogger
from typing import Any, Callable, cast, Tuple

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
    logger.info("gamdl job done")
    await sio.emit("status_update")

async def player_state_changed(data: dict[str, Any]) -> None:
    logger.info("player state changed")
    await sio.emit("player_state_changed", data)


def get_asgi_app():
    return socketio.ASGIApp(
        sio,
        socketio_path="/socket.io",
    )
