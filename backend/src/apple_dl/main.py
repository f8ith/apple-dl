from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request

from apple_dl.config import cfg
from apple_dl.routers import api, websocket
from apple_dl.logger import logger, setup_logging

@asynccontextmanager
async def lifespan(_app: FastAPI):
    setup_logging(log_level=logging.DEBUG if cfg.DEBUG else logging.INFO)
    yield

app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json", lifespan=lifespan)

app.include_router(api.v1_router, prefix='/api/v1', )
app.mount("/", websocket.get_asgi_app())

@app.exception_handler(Exception)
async def server_error_handler(request: Request, exc: Exception):
    logger.error(exc)
