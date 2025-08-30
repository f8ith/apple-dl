from logging import getLogger
from typing import Any, Callable, cast, Tuple

import socketio

from ..config import cfg

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
    getLogger("quart.app").info("job done")
    await sio.emit("status_update")

async def player_state_changed(data: dict[str, Any]) -> None:
    getLogger("quart.app").info("player state changed")
    await sio.emit("player_state_changed", data)


def register_socketio(app):
    app.asgi_app = socketio.ASGIApp(
        sio,
        app.asgi_app,
        socketio_path="/socket.io",
    )
