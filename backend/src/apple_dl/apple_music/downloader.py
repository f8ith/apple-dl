import asyncio
import re
from typing import Literal
import urllib.parse

from gamdl.api import AppleMusicApi
from gamdl.api.constants import STOREFRONT_IDS
from gamdl.downloader import (
    AppleMusicBaseDownloader,
    AppleMusicDownloader,
    AppleMusicMusicVideoDownloader,
    AppleMusicSongDownloader,
    AppleMusicUploadedVideoDownloader,
)
from gamdl.downloader import UrlInfo

from apple_dl.config import cfg


VALID_URL_RE = (
    r"("
    r"/(?P<storefront>[a-z]{2})"
    r"/(?P<type>artist|album|playlist|song|music-video|post)"
#    r"(?:/(?P<slug>[a-z0-9-・\\s\\p{script=Han}]+))?"
    r"(?:/(?P<slug>[^/]+))?"
    r"/(?P<id>[0-9]+|pl\.[0-9a-z]{32}|pl\.u-[a-zA-Z0-9]{15})"
    r"(?:\?i=(?P<sub_id>[0-9]+))?"
    r")|("
    r"(?:/(?P<library_storefront>[a-z]{2}))?"
    r"/library/(?P<library_type>|playlist|albums)"
    r"/(?P<library_id>p\.[a-zA-Z0-9]{15}|l\.[a-zA-Z0-9]{7})"
    r")"
)

AM_ITEM_TYPES = Literal["songs","albums","artists","playlists"]

def parse_url_info_utf8(url: str) -> UrlInfo | None:
    url = urllib.parse.unquote(url)

    url_regex_result = re.search(
        VALID_URL_RE,
        url,
    )
    if not url_regex_result:
        return None

    return UrlInfo(
        **url_regex_result.groupdict(),
    )


def create_apple_music():
    apple_music = AppleMusicApi.from_netscape_cookies(
        cookies_path=str(cfg.GAMDL_DIR / "cookies.txt"),
        language=cfg.AM_LANGUAGE
    )

    apple_music.storefront = "HK"

    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        asyncio.run(apple_music.setup())
    else:
        loop.run_until_complete(apple_music.setup())
    finally:
        return apple_music

def create_downloader(api: AppleMusicApi):
    # Initialize downloaders
    base_downloader = AppleMusicBaseDownloader(apple_music_api=api, temp_path="/tmp", output_path=str(cfg.MUSIC_DIR), overwrite=True)
    base_downloader.setup()

    song_downloader = AppleMusicSongDownloader(base_downloader)
    song_downloader.setup()

    music_video_downloader = AppleMusicMusicVideoDownloader(base_downloader)
    music_video_downloader.setup()

    uploaded_video_downloader = AppleMusicUploadedVideoDownloader(base_downloader)
    uploaded_video_downloader.setup()

    # Create main downloader
    downloader = AppleMusicDownloader(
        base_downloader,
        song_downloader,
        music_video_downloader,
        uploaded_video_downloader,
    )

    return downloader
