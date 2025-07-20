import asyncio
import itertools
from logging import getLogger
from typing import List, Tuple

from .config import config
from .apple_music_api import apple_music, downloader
from .routes.websocket import notify_job_done


class GamdlJob:
    id_iter = itertools.count()

    def __init__(self, url: str):
        self.id = next(self.id_iter)
        self.url = url
        self.url_info = downloader.get_url_info(self.url)

        media_id = self.url_info.id
        self.url_type = self.url_info.type
        
        if self.url_type == "song":
            self.media_info = apple_music.get_song(media_id)
        elif self.url_type in ("album", "albums"):
            if self.url_info.is_library:
                self.media_info = apple_music.get_library_album(media_id)
            else:
                self.media_info = apple_music.get_album(media_id)
        elif self.url_type == "music-video":
            self.media_info = apple_music.get_music_video(media_id)
        else:
            raise ValueError("Only songs, albums and videos allowed")

        self.artist_name = self.media_info["attributes"]["artistName"]
        self.name = self.media_info["attributes"]["name"]
        
class GamdlJobResult:
    def __init__(self, result: Tuple[int, bytes, bytes]):
        self.returncode: int = result[0]
        self.stdout: bytes = result[1]
        self.stderr: bytes = result[2]


queue: asyncio.Queue[GamdlJob] = asyncio.Queue(maxsize=100)
jobs: List[GamdlJob] = []
jobs_result: dict[int, GamdlJobResult | None] = {}
consumers = []


async def download_url(url: str) -> Tuple[int, bytes, bytes]:
    getLogger("quart.app").info(f"downloading {url}")
    gamdl_config_path = config.GAMDL_DIR / "config.json"

    cmd = f"gamdl {url} --config-path={gamdl_config_path}"
    proc = await asyncio.create_subprocess_shell(
        cmd,
        shell=True,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )

    stdout, stderr = await proc.communicate()
    returncode: int = proc.returncode if proc.returncode else 0

    return returncode, stdout, stderr


async def create_job_task(url: str) -> GamdlJob:
    gamdl_job = GamdlJob(url)
    jobs.append(gamdl_job)
    jobs_result[gamdl_job.id] = None
    await queue.put(gamdl_job)
    return gamdl_job
    
async def consume(queue: asyncio.Queue[GamdlJob]):
    while True:
        # wait for an item from the producer
        item = await queue.get()
        
        job_result = GamdlJobResult(await download_url(item.url))

        # Notify the queue that the item has been processed
        queue.task_done()
        
        jobs_result[item.id] = job_result
        
        await notify_job_done(item.id)

async def start_consumers() -> None:
    # schedule consumers
    for _ in range(3):
        consumer = asyncio.create_task(consume(queue))
        consumers.append(consumer)
        
async def stop_consumers() -> None:
    for consumer in consumers:
        consumer.cancel()

    await asyncio.gather(*consumers, return_exceptions=True)

def job_state():
    return jobs, jobs_result