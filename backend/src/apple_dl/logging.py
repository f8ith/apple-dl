import logging
from logging.config import dictConfig

dictConfig(
    {
        "version": 1,
        "formatters": {
            "standard": {
                "format": "[%(asctime)s] [%(levelname)s] %(name)s: %(message)s"
            },
        },
        "handlers": {
            "default": {
                "level": "INFO",
                "formatter": "standard",
                "class": "logging.StreamHandler",
                "stream": "ext://sys.stdout",  # Default is stderr
            },
        },
        "loggers": {"quart.app": {"level": "INFO", "handlers": ["default"]}},
    }
)


def load_logging() -> None:
    ...
