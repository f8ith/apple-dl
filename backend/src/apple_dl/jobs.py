import asyncio
import itertools
from logging import getLogger
from os import PathLike
from typing import List, Tuple

from .config import cfg
from .apple_music_api import apple_music, downloader
from .routes.websocket import notify_job_done


class GamdlJob:
    id_iter = itertools.count()

    def __init__(self, url: str, output_path: PathLike | None = None):
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

        self.album_name = self.media_info["attributes"].get("albumName")
        self.artist_name = self.media_info["attributes"].get("artistName")
        self.name = self.media_info["attributes"].get("name")
        self.has_lyrics = self.media_info["attributes"].get("hasLyrics")
        self.has_time_synced_lyrics = self.media_info["attributes"].get(
            "hasTimeSyncedLyrics"
        )
        self.track_number = self.media_info["attributes"].get("trackNumber")
        self.output_path = output_path
        self.job_completed = asyncio.Event()
        self.job_result: GamdlJobResult | None = None

    def __json__(self):
        ret = {
            "id": self.id,
            "album_name": self.album_name,
            "artist_name": self.artist_name,
            "name": self.name,
            "attributes": self.media_info["attributes"],
            "url": self.url,
            "image": self.media_info["attributes"]["artwork"]["url"],
            "type": self.url_type,
        }

        if self.job_result:
            ret.update(self.job_result.__json__())
        else:
            ret["status"] = "pending"

        return ret


class GamdlJobResult:
    def __init__(self, result: Tuple[int, bytes, bytes]):
        self.returncode: int = result[0]
        self.stdout: bytes = result[1]
        self.stderr: bytes = result[2]

    def __json__(self):
        ret: dict[str, str] = {}
        if self.returncode != 0:
            ret["status"] = "failed"
        else:
            ret["status"] = "done"
        ret["stdout"] = self.stdout.decode()
        ret["stderr"] = self.stderr.decode()

        return ret


job_queue: asyncio.Queue[GamdlJob] = asyncio.Queue(maxsize=100)
jobs: List[GamdlJob] = []
consumers = []


async def download_url(
    url: str, output_path: PathLike | None = None
) -> Tuple[int, bytes, bytes]:
    # TODO: using gamdl directly from the commandline is extremely unreliable. write my own function
    getLogger("quart.app").info(f"downloading {url}")
    gamdl_config_path = cfg.GAMDL_DIR / "config.json"

    cmd = f"gamdl {url} --config-path={gamdl_config_path}"
    if output_path:
        cmd += f" --output-path={output_path}"

    print(cmd)
    proc = await asyncio.create_subprocess_shell(
        cmd,
        shell=True,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )

    stdout, stderr = await proc.communicate()
    returncode: int = proc.returncode if proc.returncode else 0

    return returncode, stdout, stderr


async def create_job_task(url: str, output_path: PathLike | None = None) -> GamdlJob:
    gamdl_job = GamdlJob(url, output_path)
    jobs.append(gamdl_job)
    await job_queue.put(gamdl_job)
    return gamdl_job


async def consume(queue: asyncio.Queue[GamdlJob]):
    while True:
        # wait for an item from the producer
        item = await queue.get()

        job_result = GamdlJobResult(await download_url(item.url, item.output_path))

        # Notify the queue that the item has been processed
        queue.task_done()

        item.job_result = job_result

        item.job_completed.set()
        await notify_job_done(item.id)


async def start_consumers() -> None:
    # schedule consumers
    for _ in range(3):
        consumer = asyncio.create_task(consume(job_queue))
        consumers.append(consumer)


async def stop_consumers() -> None:
    for consumer in consumers:
        consumer.cancel()

    # await asyncio.gather(*consumers, return_exceptions=True)


def job_state():
    return jobs
