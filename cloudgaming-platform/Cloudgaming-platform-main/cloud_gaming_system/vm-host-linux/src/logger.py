"""Logging configuration for VM host service"""

import logging
import sys
from logging.handlers import RotatingFileHandler
import coloredlogs
from .config import config


def setup_logger(name: str = "vm-host") -> logging.Logger:
    """Set up and configure logger"""
    logger = logging.getLogger(name)
    
    # Get log level from config
    log_level = config.get("logging.level", "INFO")
    logger.setLevel(getattr(logging, log_level))

    # Console handler with colors
    coloredlogs.install(
        level=log_level,
        logger=logger,
        fmt="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # File handler with rotation
    log_file = config.get("logging.file", "vm-host.log")
    max_size = config.get("logging.max_size", 10485760)  # 10MB
    backup_count = config.get("logging.backup_count", 5)

    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=max_size,
        backupCount=backup_count,
    )
    file_handler.setLevel(getattr(logging, log_level))
    file_formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)

    return logger


# Global logger instance
logger = setup_logger()
