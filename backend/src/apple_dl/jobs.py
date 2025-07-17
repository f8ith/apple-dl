import asyncio
import itertools
from logging import getLogger
import os
from typing import List, Tuple

from quart import current_app

from .apple_music_api import apple_music, downloader
from .routes.websocket import notify_job_done


class GamdlJob:
    id_iter = itertools.count()

    def __init__(self, url: str, task: asyncio.Task):
        self.id = next(self.id_iter)
        self.url = url
        self.task = task
        self.url_info = downloader.get_url_info(self.url)

        media_id = self.url_info.id
        self.url_type = self.url_info.type

        if self.url_type == "song":
            self.media_info = apple_music.get_song(media_id)
        elif self.url_type == ("album", "albums"):
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


queue: List[GamdlJob] = []
sema = asyncio.Semaphore(3)


async def download_url(url: str) -> Tuple[bytes, bytes]:
    getLogger("quart.app").info(f"downloading {url}")
    gamdl_config_path = current_app.config["GAMDL_DIR"]
    async with sema:
        cmd = f"gamdl {url} --config-path={gamdl_config_path}"
        proc = await asyncio.create_subprocess_shell(
            cmd,
            shell=True,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        stdout, stderr = await proc.communicate()

        return stdout, stderr


async def create_job_task(url: str):
    task = asyncio.create_task(download_url(url))
    gamdl_job = GamdlJob(url, task)
    queue.append(gamdl_job)
    await task
    await notify_job_done(gamdl_job.id)
