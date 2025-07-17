import asyncio

from quart import Blueprint, request

from ..apple_music_api import apple_music
from ..jobs import create_job_task, queue

api_bp = Blueprint("api", __name__)


@api_bp.route("/ping")
def ping():
    return "pong"


@api_bp.route("/search")
async def search():
    term = request.args.get("term")
    if not term:
        return {}
    return apple_music.search(term)


@api_bp.route("/submit_job", methods=["POST"])
async def submit_job():
    data = await request.get_json()
    if not data:
        return {"status": "bad json"}, 400

    url: str | None = data.get("url")

    if not (url and url.startswith("http")):
        return {"status": "bad url"}, 400

    asyncio.create_task(create_job_task(url))
    return {"status": "ok"}


@api_bp.route("/jobs", methods=["GET"])
async def get_jobs():
    jobs = []
    for x in queue:
        job_dict = {
            "id": x.id,
            "url": x.url,
            "name": x.name,
            "artist_name": x.artist_name,
            "url_type": x.url_type,
            "done": x.task.done(),
        }
        if job_dict["done"]:
            stdout: bytes
            stderr: bytes
            stdout, stderr = x.task.result()
            job_dict["stdout"] = stdout.decode()
            job_dict["stderr"] = stderr.decode()

        jobs.append(job_dict)

    return {"jobs": jobs}
