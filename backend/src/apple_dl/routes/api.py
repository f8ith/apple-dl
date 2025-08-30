import asyncio

from quart import Blueprint, jsonify, request
from quart_cors import cors, route_cors

from ..apple_music_api import apple_music
from ..jobs import (
    create_job_task,
    job_state,
    start_consumers,
    stop_consumers,
)

api_bp = Blueprint("api", __name__)


@api_bp.before_app_serving
async def start_job_consumers():
    asyncio.create_task(start_consumers())


@api_bp.route("/ping")
async def ping():
    return "pong"


@api_bp.route("/search", methods=["GET"])
@route_cors(allow_origin="*")
async def search():
    term = request.args.get("term")
    if not term:
        return {}
    return apple_music.search(term)


@api_bp.route("/submit_job", methods=["POST"])
async def submit_job():
    data = await request.get_json()
    if not data:
        return {"errors": ["bad json"]}, 400

    url: str | None = data.get("url")

    if not (url and url.startswith("http")):
        return {"errors": ["bad url"]}, 400

    job = await create_job_task(url)
    return {"job_id": job.id}


@api_bp.route("/jobs", methods=["GET"])
async def get_jobs():
    jobs = job_state()
    return jsonify([job.__json__() for job in jobs])


@api_bp.after_app_serving
async def api_cleanup():
    asyncio.create_task(stop_consumers())
