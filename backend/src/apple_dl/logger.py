import logging.config

from apple_dl.config import cfg

# Legacy config
#logging.config.dictConfig(
#    {
#        "version": 1,
#        "formatters": {
#            "standard": {
#                "format": "[%(asctime)s] [%(levelname)s] %(name)s: %(message)s"
#            },
#        },
#        "handlers": {
#            "default": {
#                "level": "INFO",
#                "formatter": "standard",
#                "class": "logging.StreamHandler",
#                "stream": "ext://sys.stdout",  # Default is stderr
#            },
#        },
#        "loggers": {"apple_dl":{"level": "DEBUG" if cfg.DEBUG else "INFO", "handlers": ["default"]}}
#    }
#)

logger = logging.getLogger("uvicorn.error").getChild("apple_dl")

def setup_logging(log_level: int):
    uvicorn_logger = logging.getLogger("uvicorn")
    uvicorn_logger.propagate = False

    logger.setLevel(log_level)
