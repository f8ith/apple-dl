from gamdl import apple_music_api, itunes_api, downloader

from .config import cfg

apple_music = apple_music_api.AppleMusicApi.from_netscape_cookies(
    cookies_path=cfg.GAMDL_DIR / "cookies.txt"
)
itunes = itunes_api.ItunesApi(
    apple_music.storefront,
    apple_music.language,
)

downloader = downloader.Downloader(apple_music, itunes)
