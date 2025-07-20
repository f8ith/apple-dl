import os
from pathlib import Path


class Config():
    FRONTEND_DIST_DIR = Path(os.environ.get("FRONTEND_DIST_DIR", "../frontend/dist"))
    DEBUG = False
    GAMDL_DIR = Path(os.environ.get("GAMDL_DIR", "."))
    ALLOW_ORIGINS = []

class DevConfig():
    ALLOW_ORIGINS = [
        "http://localhost:5001",
        "http://127.0.0.1:5001",
        "http://127.0.0.1:5000",
        "http://localhost:6887",
    ]


config = Config()
