import logging
import sys

def setup_logging():
    logger = logging.getLogger("vision_assistant")
    logger.setLevel(logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        '{"level": "%(levelname)s", "step": "%(name)s", "message": "%(message)s"}'
    )
    handler.setFormatter(formatter)

    logger.addHandler(handler)
    return logger
