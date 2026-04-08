"""Configuration loader for VM host service"""

import os
import yaml
from pathlib import Path
from typing import Any, Dict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Config:
    """Configuration manager"""

    def __init__(self, config_path: str = "config/config.yaml"):
        self.config_path = Path(config_path)
        self.config: Dict[str, Any] = {}
        self.load_config()
        self.override_with_env()

    def load_config(self) -> None:
        """Load configuration from YAML file"""
        if self.config_path.exists():
            with open(self.config_path, "r") as f:
                self.config = yaml.safe_load(f) or {}
        else:
            raise FileNotFoundError(f"Config file not found: {self.config_path}")

    def override_with_env(self) -> None:
        """Override configuration with environment variables"""
        # Signaling server
        if os.getenv("SIGNALING_SERVER_URL"):
            self.config["signaling"]["url"] = os.getenv("SIGNALING_SERVER_URL")

        # VM identification
        if os.getenv("VM_ID"):
            self.config["vm"]["id"] = os.getenv("VM_ID")
        if os.getenv("VM_HOSTNAME"):
            self.config["vm"]["hostname"] = os.getenv("VM_HOSTNAME")

        # Video settings
        if os.getenv("DISPLAY"):
            self.config["video"]["display"] = os.getenv("DISPLAY")
        if os.getenv("VIDEO_WIDTH"):
            self.config["video"]["width"] = int(os.getenv("VIDEO_WIDTH"))
        if os.getenv("VIDEO_HEIGHT"):
            self.config["video"]["height"] = int(os.getenv("VIDEO_HEIGHT"))
        if os.getenv("VIDEO_FPS"):
            self.config["video"]["fps"] = int(os.getenv("VIDEO_FPS"))

        # Bitrate settings
        if os.getenv("BITRATE_HIGH"):
            self.config["bitrate"]["high"] = int(os.getenv("BITRATE_HIGH"))
        if os.getenv("BITRATE_MEDIUM"):
            self.config["bitrate"]["medium"] = int(os.getenv("BITRATE_MEDIUM"))
        if os.getenv("BITRATE_LOW"):
            self.config["bitrate"]["low"] = int(os.getenv("BITRATE_LOW"))

        # Logging
        if os.getenv("LOG_LEVEL"):
            self.config["logging"]["level"] = os.getenv("LOG_LEVEL")

    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value by dot-separated key"""
        keys = key.split(".")
        value = self.config
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        return value

    def get_quality_preset(self, quality: str) -> Dict[str, Any]:
        """Get quality preset configuration"""
        presets = self.config.get("quality_presets", {})
        return presets.get(quality, presets.get("high", {}))


# Global config instance
config = Config()
