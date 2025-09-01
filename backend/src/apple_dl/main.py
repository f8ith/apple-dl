from fastapi import FastAPI, Request

from apple_dl.routers import api, websocket
from apple_dl.logger import logger

app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")

app.include_router(api.v1_router, prefix='/api/v1', )
app.mount("/", websocket.get_asgi_app())

@app.exception_handler(Exception)
async def server_error_handler(request: Request, exc: Exception):
    logger.error(exc)
