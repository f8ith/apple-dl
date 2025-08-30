import logging.config

logging.config.dictConfig(
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

logger = logging.getLogger("apple_dl")

def load_logging() -> None:
    ...
