import asyncio

from quart import Blueprint, request
from quart_cors import cors, route_cors

from ..apple_music_api import apple_music
from ..jobs import create_job_task, job_state, queue, start_consumers, stop_consumers

api_bp = Blueprint("api", __name__)

@api_bp.before_app_serving
async def start_job_consumers():
    await start_consumers()


@api_bp.route("/ping")
async def ping():
    return "pong"


@api_bp.route("/search")
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
        return {"status": "bad json"}, 400

    url: str | None = data.get("url")

    if not (url and url.startswith("http")):
        return {"status": "bad url"}, 400

    job = await create_job_task(url)
    return {"status": "ok", "job_id": job.id}


@api_bp.route("/jobs", methods=["GET"])
async def get_jobs():
    jobs_json = []
    jobs, jobs_result = job_state()
    for x in jobs:
        job_dict = {
            "id": x.id,
            "url": x.url,
            "name": x.name,
            "artist_name": x.artist_name,
            "url_type": x.url_type,
            "status": "pending",
        }
        result = jobs_result[x.id]
        if result:
            if result.returncode != 0:
                job_dict["status"] = "failed"
            else:
                job_dict["status"] = "done"
            job_dict["stdout"] = result.stdout.decode()
            job_dict["stderr"] = result.stderr.decode()

        jobs_json.append(job_dict)

    return {"jobs": jobs_json}


@api_bp.after_app_serving
async def api_cleanup():
    await stop_consumers()