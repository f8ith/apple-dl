import asyncio
import itertools
from os import PathLike
from typing import Any, List, Sequence, Tuple
import urllib.parse

from gamdl.downloader import UrlInfo, DownloadItem
from gamdl.downloader.exceptions import MediaNotStreamableError

from apple_dl.schemas.job_schemas import GamdlJobResultSchema, GamdlJobSchema

from .apple_music.downloader import create_apple_music, create_downloader
from .config import cfg
from .logger import logger
from .routers.websocket import notify_job_done

# TODO: Downloader might cause issues with stale requests
apple_music = create_apple_music()
downloader = create_downloader(apple_music)

class GamdlJob:
    id_iter = itertools.count()

    def __init__(self, url: str, url_info: UrlInfo, url_type: str, media_id: str, media_info, output_path: PathLike | None = None):
        self.id = next(self.id_iter)
        self.url = url
        self.url_info = url_info
        self.url_type = url_type

        self.media_id = media_id
        self.media_info: dict[str, Any] = media_info
        self.album_name = self.media_info["attributes"].get("albumName")
        self.artist_name = self.media_info["attributes"].get("artistName")
        self.name = self.media_info["attributes"].get("name")
        self.has_lyrics = self.media_info["attributes"].get("hasLyrics")
        self.has_synced_lyrics = self.media_info["attributes"].get(
            "hasTimeSyncedLyrics"
        )
        self.track_number = self.media_info["attributes"].get("trackNumber")
        self.output_path = output_path
        self.job_completed = asyncio.Event()
        self.job_result: Sequence[DownloadItem] | Exception | None = None


    @classmethod
    async def create(cls, url: str, output_path: PathLike | None = None):

        url_info = downloader.get_url_info(url)
        #parse_url_info_utf8(url)

        if not url_info:
            raise ValueError(f"unable to parse {urllib.parse.unquote(url)}")

        url_info = url_info

        media_id = url_info.sub_id or url_info.id or url_info.library_id
        url_type = "song" if url_info.sub_id else url_info.type

        if url_type == "song":
            media_info_resp = await apple_music.get_song(media_id)
        elif url_type in ("album", "albums"):
            if url_info.library_id:
                media_info_resp = await apple_music.get_library_album(media_id)
            else:
                media_info_resp = await apple_music.get_album(media_id)
        elif url_type == "music-video":
            media_info_resp = await apple_music.get_music_video(media_id)
        elif url_type == "playlist":
            media_info_resp = await apple_music.get_music_video(media_id)
        else:
            raise ValueError("only songs, albums, playlists and videos allowed")

        if not media_info_resp:
            raise ValueError(f"unable to retrieve media_info for {url}")

        media_info = media_info_resp.get("data")

        if not media_info:
            raise ValueError(f"invalid media_info for {url}")

        return cls(url, url_info, url_type, media_id, media_info[0], output_path)

    def __pydantic__(self):
        ret = GamdlJobSchema(
            id=self.id,
            album_name=self.album_name,
            artist_name=self.artist_name,
            name=self.name,
            attributes=self.media_info["attributes"],
            url=self.url,
            image=(self.media_info.get("attributes", {}).get("artwork" ,{})).get("url"),
            type=self.url_type,
            status="pending",
            error=None
        )

        if self.job_result:
            if isinstance(self.job_result, Exception):
                ret.status = "failed"
                ret.error = str(self.job_result)
            else:
                ret.status = "done"

        return ret

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
            #ret.update(self.job_result.__json__())
            ...
        else:
            ret["status"] = "pending"

        return ret


class GamdlJobResult:
    def __init__(self, result: Tuple[int, bytes, bytes]):
        self.returncode: int = result[0]
        self.stdout: bytes = result[1]
        self.stderr: bytes = result[2]

    def __pydantic__(self):
        if self.returncode != 0:
            status = "failed"
        else:
            status = "done"

        return GamdlJobResultSchema(status=status, stdout=self.stdout.decode(), stderr=self.stderr.decode())


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
    logger.info(f"downloading {url}")

    # Legacy subprocess downloader
    gamdl_config_path = cfg.GAMDL_DIR / "config.json"

    cmd = f"gamdl {url} --config-path={gamdl_config_path}"
    if output_path:
        cmd += f" --output-path={output_path}"

    logger.info(cmd)
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
    gamdl_job = await GamdlJob.create(url, output_path)
    jobs.append(gamdl_job)
    await job_queue.put(gamdl_job)
    return gamdl_job


async def consume(queue: asyncio.Queue[GamdlJob]):
    while True:
        results = []
        error = None

        # wait for an item from the producer
        item = await queue.get()
        loop = asyncio.get_running_loop()

        #downloader = create_downloader(apple_music)
        #download_queue = downloader.get_download_queue(item.url_info)

        download_queue = await downloader.get_download_queue(item.url_info)

        if download_queue:
            for download_item in download_queue:
                if (isinstance(download_item, Exception)):
                    logger.warning(
                        f"({item.name}) {download_item} encountered error, skipping",
                    )
                    continue

                try:
                    if download_item.media_metadata["type"] in {"songs", "library-songs"}:
                        # TODO write my own function, get info without redownloading songs
                        logger.info(f"downloading {id}")

                        await downloader.download(download_item)
                        results.append(download_item)
                except (
                    MediaNotStreamableError
                ) as e:
                    logger.warning(
                        f"({item.name}) {e}, is not streamable skipping",
                    )
                except Exception as e:
                    logger.error(
                        f'failed to download "{item.name}"',
                    )
                    error = e
        else:
            error = ValueError("download queue is empty")

        # Notify the queue that the item has been processed
        queue.task_done()

        if not results:
            error = ValueError("download info results is empty")

        item.job_result = error if error else results

        item.job_completed.set()

        await notify_job_done(item.id)



async def start_consumers() -> None:
    # schedule consumers
    # TODO gamdl does not support parallelism, need custom function
    for _ in range(1):
        consumer = asyncio.create_task(consume(job_queue))
        consumers.append(consumer)


async def stop_consumers() -> None:
    for consumer in consumers:
        consumer.cancel()


def job_state():
    return jobs
