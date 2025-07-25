from logging import getLogger
from typing import Callable, cast, Tuple

import socketio

from ..config import config

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
        cors_allowed_origins=config.ALLOW_ORIGINS,
    ),
)


async def notify_job_done(_: int) -> None:
    getLogger("quart.app").info("job done")
    await sio.emit("status_update")


def register_socketio(app):
    app.asgi_app = socketio.ASGIApp(
        sio,
        app.asgi_app,
        socketio_path="/socket.io",
    )
