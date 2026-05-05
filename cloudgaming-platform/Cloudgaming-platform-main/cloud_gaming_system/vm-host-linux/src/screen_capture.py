"""Screen capture using FFmpeg and X11"""

import asyncio
import subprocess
import threading
from typing import Optional

import numpy as np
from av import VideoFrame

from .config import config
from .logger import logger


class ScreenCapture:
    """Screen capture using FFmpeg for X11 display"""

    def __init__(self, quality: str = "high"):
        self.quality = quality
        self.preset = config.get_quality_preset(quality)
        self.display = config.get("video.display", ":0")
        self.width = self.preset.get("width", 1920)
        self.height = self.preset.get("height", 1080)
        self.fps = self.preset.get("fps", 60)
        self.process: Optional[subprocess.Popen] = None
        self.running = False
        self.frame_queue: asyncio.Queue[bytes] = asyncio.Queue(maxsize=30)
        self._loop: Optional[asyncio.AbstractEventLoop] = None
        self.read_thread: Optional[threading.Thread] = None

    def get_ffmpeg_command(self) -> list[str]:
        """Generate FFmpeg command for screen capture"""
        return [
            "ffmpeg",
            "-f",
            "x11grab",
            "-video_size",
            f"{self.width}x{self.height}",
            "-framerate",
            str(self.fps),
            "-i",
            self.display,
            "-c:v",
            "rawvideo",
            "-pix_fmt",
            "yuv420p",
            "-f",
            "rawvideo",
            "-",
        ]

    async def start(self) -> None:
        """Start screen capture"""
        if self.running:
            logger.warning("Screen capture already running")
            return

        logger.info(f"Starting screen capture: {self.width}x{self.height}@{self.fps}fps")

        try:
            self._loop = asyncio.get_running_loop()
            command = self.get_ffmpeg_command()
            self.process = subprocess.Popen(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL,
                bufsize=10**8,
            )
            self.running = True

            # Start frame reading in background thread
            self.read_thread = threading.Thread(target=self._read_frames, daemon=True)
            self.read_thread.start()

            logger.info("Screen capture started successfully")
        except Exception as e:
            logger.error(f"Failed to start screen capture: {e}")
            raise

    def _push_frame_async(self, frame_bytes: bytes) -> None:
        if self._loop and not self._loop.is_closed() and self.running:
            self._loop.call_soon_threadsafe(self._enqueue_frame, frame_bytes)

    def _enqueue_frame(self, frame_bytes: bytes) -> None:
        if self.frame_queue.full():
            try:
                self.frame_queue.get_nowait()
            except asyncio.QueueEmpty:
                pass

        try:
            self.frame_queue.put_nowait(frame_bytes)
        except asyncio.QueueFull:
            # Extremely unlikely due to prior eviction.
            pass

    def _read_frames(self) -> None:
        """Read frames from FFmpeg process (runs in background thread)"""
        frame_size = self.width * self.height * 3 // 2  # YUV420p format

        while self.running and self.process and self.process.stdout:
            try:
                raw_frame = self.process.stdout.read(frame_size)
                if not raw_frame or len(raw_frame) != frame_size:
                    if self.running:
                        logger.warning("Incomplete frame received")
                    continue

                self._push_frame_async(raw_frame)

            except Exception as e:
                if self.running:
                    logger.error(f"Error reading frame: {e}")
                break

    async def get_frame(self) -> Optional[VideoFrame]:
        """Get next video frame"""
        try:
            raw_frame = await asyncio.wait_for(self.frame_queue.get(), timeout=1.0)

            # Convert raw YUV420p data to VideoFrame
            frame = VideoFrame(self.width, self.height, "yuv420p")

            # Copy data to frame
            y_size = self.width * self.height
            uv_size = y_size // 4

            y_data = np.frombuffer(raw_frame[:y_size], dtype=np.uint8)
            u_data = np.frombuffer(raw_frame[y_size : y_size + uv_size], dtype=np.uint8)
            v_data = np.frombuffer(raw_frame[y_size + uv_size :], dtype=np.uint8)

            frame.planes[0].update(y_data.reshape(self.height, self.width))
            frame.planes[1].update(u_data.reshape(self.height // 2, self.width // 2))
            frame.planes[2].update(v_data.reshape(self.height // 2, self.width // 2))

            return frame
        except asyncio.TimeoutError:
            return None
        except Exception as e:
            logger.error(f"Error getting frame: {e}")
            return None

    async def stop(self) -> None:
        """Stop screen capture"""
        logger.info("Stopping screen capture")
        self.running = False

        if self.process:
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.process.kill()
                self.process.wait()
            self.process = None

        if self.read_thread and self.read_thread.is_alive():
            self.read_thread.join(timeout=1)

        logger.info("Screen capture stopped")

    def change_quality(self, quality: str) -> None:
        """Change quality preset"""
        logger.info(f"Changing quality to: {quality}")
        self.quality = quality
        self.preset = config.get_quality_preset(quality)
        self.width = self.preset.get("width", 1920)
        self.height = self.preset.get("height", 1080)
        self.fps = self.preset.get("fps", 60)

        # Note: Requires restart to apply
        logger.info("Quality preset updated. Restart capture to apply changes.")
