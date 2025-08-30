import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, APIRouter, HTTPException
from pydantic import BaseModel

from ...jobs import (
    create_job_task,
    job_state,
    start_consumers,
    stop_consumers,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(start_consumers())
    yield
    await stop_consumers()

router = APIRouter(prefix="/jobs", lifespan=lifespan)

class JobReq(BaseModel):
    url: str 

@router.post("/submit")
async def submit_job(job_req: JobReq):
    if not (job_req.url.startswith("http")):
        raise HTTPException(detail="bad url", status_code=400)

    job = await create_job_task(job_req.url)
    return {"job_id": job.id}


@router.get("/all")
async def get_jobs():
    jobs = job_state()
    jobs_pydantic = [job.__pydantic__() for job in jobs]
    return jobs_pydantic
