import re
from typing import Literal
import urllib.parse

from gamdl import AppleMusicApi, ItunesApi, Downloader, DownloaderSong
from gamdl.models import UrlInfo

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


apple_music = AppleMusicApi.from_netscape_cookies(
    cookies_path=cfg.GAMDL_DIR / "cookies.txt",
    language=cfg.AM_LANGUAGE
)
itunes = ItunesApi(
    apple_music.storefront,
    apple_music.language,
)

downloader = Downloader(apple_music, itunes, output_path=cfg.MUSIC_DIR, overwrite=True)
downloader.set_cdm()
downloader_song = DownloaderSong(downloader=downloader)