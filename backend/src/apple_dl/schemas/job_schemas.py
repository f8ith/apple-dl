from typing import Any, TYPE_CHECKING
from attr import define

from apple_dl.jobs import GamdlJob, GamdlJobResult


@define
class GamdlJobResultSchema:
    status: str
    stdout: str
    stderr: str

    @classmethod
    def from_jobresult(cls, job_result: "GamdlJobResult"):
        if job_result.returncode != 0:
            status = "failed"
        else:
            status = "done"

        return cls(status, job_result.stdout.decode(), job_result.stderr.decode())


@define
class GamdlJobSchema:
    id: int
    album_name: str
    artist_name: str
    name: str
    attributes: dict[str, Any]
    url: str
    image: str | None
    type: str
    status: str
    stdout: str | None
    stderr: str | None

    @classmethod
    def from_job(cls, job: "GamdlJob"):
        ret = cls(
            job.id,
            job.album_name,
            job.artist_name,
            job.name,
            job.media_info["attributes"],
            job.url,
            job.media_info["attributes"]["artwork"]["url"],
            job.url_type,
            "pending",
            None,
            None,
        )

        if job.job_result:
            job_result = GamdlJobResultSchema.from_jobresult(job.job_result)
            ret.status = job_result.status
            ret.stdout = job_result.stdout
            ret.stderr = job_result.stderr

        return ret
