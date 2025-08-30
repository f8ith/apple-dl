import os
from pathlib import Path


class Config:
    FRONTEND_DIST_DIR = Path(os.environ.get("FRONTEND_DIST_DIR", "../frontend/dist"))
    DEBUG = os.environ.get("DEBUG", None) is not None
    GAMDL_DIR = Path(os.environ.get("GAMDL_DIR", "."))
    CACHE_DIR = Path(os.environ.get("CACHE_DIR", "/var/cache"))
    MUSIC_DIR = Path(os.environ.get("MUSIC_DIR", CACHE_DIR / "music"))
    ALLOW_ORIGINS = []
    DISCORD_CLIENT_ID = os.environ.get("DISCORD_CLIENT_ID", "")
    DISCORD_CLIENT_SECRET = os.environ.get("DISCORD_CLIENT_SECRET", "")
    DISCORD_BOT_TOKEN = os.environ.get("DISCORD_BOT_TOKEN", "")
    DISCORD_ENABLED = bool(os.environ.get("DISCORD_ENABLED", DISCORD_BOT_TOKEN != ""))
    DISCORD_QUEUE_CAPACITY = int(os.environ.get("DISCORD_CLIENT_CAPACITY", 200))
    ENABLED_EXTENSIONS = os.environ.get("ENABLED_EXTENSIONS", "admin music").split()
    SERVER_URL = os.environ.get("SERVER_URL", "")


class DevConfig:
    ALLOW_ORIGINS = [
        "http://localhost:5001",
        "http://127.0.0.1:5001",
        "http://127.0.0.1:5000",
        "http://localhost:6887",
    ]


cfg = Config()
