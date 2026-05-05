"""Configuration loader for VM host service"""

import os
from pathlib import Path
from typing import Any, Dict

import yaml
from dotenv import load_dotenv


class Config:
    """Configuration manager"""

    def __init__(self, config_path: str | None = None):
        self.base_dir = Path(__file__).resolve().parents[1]
        env_path = self.base_dir / ".env"
        load_dotenv(dotenv_path=env_path, override=False)

        resolved_config_path = (
            config_path
            or os.getenv("VM_HOST_CONFIG_PATH")
            or str(self.base_dir / "config" / "config.yaml")
        )
        self.config_path = Path(resolved_config_path)
        self.config: Dict[str, Any] = {}
        self.load_config()
        self.override_with_env()

    def load_config(self) -> None:
        """Load configuration from YAML file"""
        if self.config_path.exists():
            with self.config_path.open("r", encoding="utf-8") as f:
                self.config = yaml.safe_load(f) or {}
        else:
            raise FileNotFoundError(f"Config file not found: {self.config_path}")

    def _ensure_section(self, section: str) -> Dict[str, Any]:
        current = self.config.get(section)
        if not isinstance(current, dict):
            self.config[section] = {}
        return self.config[section]

    def override_with_env(self) -> None:
        """Override configuration with environment variables"""
        signaling = self._ensure_section("signaling")
        vm = self._ensure_section("vm")
        video = self._ensure_section("video")
        bitrate = self._ensure_section("bitrate")
        logging_cfg = self._ensure_section("logging")

        # Signaling server
        if os.getenv("SIGNALING_SERVER_URL"):
            signaling["url"] = os.getenv("SIGNALING_SERVER_URL")

        if os.getenv("SIGNALING_NAMESPACE"):
            signaling["namespace"] = os.getenv("SIGNALING_NAMESPACE")

        # VM identification
        if os.getenv("VM_ID"):
            vm["id"] = os.getenv("VM_ID")
        if os.getenv("VM_HOSTNAME"):
            vm["hostname"] = os.getenv("VM_HOSTNAME")

        # Video settings
        if os.getenv("DISPLAY"):
            video["display"] = os.getenv("DISPLAY")
        if os.getenv("VIDEO_WIDTH"):
            video["width"] = int(os.getenv("VIDEO_WIDTH"))
        if os.getenv("VIDEO_HEIGHT"):
            video["height"] = int(os.getenv("VIDEO_HEIGHT"))
        if os.getenv("VIDEO_FPS"):
            video["fps"] = int(os.getenv("VIDEO_FPS"))

        # Bitrate settings
        if os.getenv("BITRATE_HIGH"):
            bitrate["high"] = int(os.getenv("BITRATE_HIGH"))
        if os.getenv("BITRATE_MEDIUM"):
            bitrate["medium"] = int(os.getenv("BITRATE_MEDIUM"))
        if os.getenv("BITRATE_LOW"):
            bitrate["low"] = int(os.getenv("BITRATE_LOW"))

        # Logging
        if os.getenv("LOG_LEVEL"):
            logging_cfg["level"] = os.getenv("LOG_LEVEL")

    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value by dot-separated key"""
        keys = key.split(".")
        value: Any = self.config
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
