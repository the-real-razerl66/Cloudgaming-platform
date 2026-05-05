"""WebRTC peer connection using aiortc"""

import asyncio
from typing import Optional, Callable
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
from aiortc.contrib.media import MediaBlackhole, MediaRecorder
from av import VideoFrame
from .config import config
from .logger import logger
from .screen_capture import ScreenCapture


class ScreenVideoTrack(VideoStreamTrack):
    """Custom video track that streams screen capture"""

    def __init__(self, screen_capture: ScreenCapture):
        super().__init__()
        self.screen_capture = screen_capture
        self.frame_count = 0

    async def recv(self) -> VideoFrame:
        """Receive next video frame"""
        pts, time_base = await self.next_timestamp()
        
        # Get frame from screen capture
        frame = await self.screen_capture.get_frame()
        
        if frame:
            frame.pts = pts
            frame.time_base = time_base
            self.frame_count += 1
            return frame
        else:
            # Return black frame if no frame available
            frame = VideoFrame(
                self.screen_capture.width,
                self.screen_capture.height,
                "yuv420p"
            )
            frame.pts = pts
            frame.time_base = time_base
            return frame


class WebRTCPeer:
    """WebRTC peer connection manager"""

    def __init__(self, session_id: str, quality: str = "high"):
        self.session_id = session_id
        self.quality = quality
        self.pc: Optional[RTCPeerConnection] = None
        self.screen_capture: Optional[ScreenCapture] = None
        self.video_track: Optional[ScreenVideoTrack] = None
        self.data_channel = None
        self.on_data_channel_message: Optional[Callable] = None
        logger.info(f"WebRTC peer initialized for session: {session_id}")

    async def create_connection(self) -> None:
        """Create RTCPeerConnection with STUN/TURN servers"""
        # Get ICE servers from config
        stun_servers = config.get("network.stun_servers", [])
        turn_servers = config.get("network.turn_servers", [])
        
        ice_servers = []
        for stun in stun_servers:
            ice_servers.append({"urls": stun})
        for turn in turn_servers:
            ice_servers.append(turn)
        
        # Create peer connection
        configuration = {"iceServers": ice_servers} if ice_servers else None
        self.pc = RTCPeerConnection(configuration)
        
        # Set up event handlers
        self.pc.on("connectionstatechange", self._on_connection_state_change)
        self.pc.on("iceconnectionstatechange", self._on_ice_connection_state_change)
        self.pc.on("datachannel", self._on_data_channel)
        
        logger.info("RTCPeerConnection created")

    async def add_video_track(self) -> None:
        """Add video track with screen capture"""
        # Create and start screen capture
        self.screen_capture = ScreenCapture(quality=self.quality)
        await self.screen_capture.start()
        
        # Create video track
        self.video_track = ScreenVideoTrack(self.screen_capture)
        
        # Add track to peer connection
        if self.pc:
            self.pc.addTrack(self.video_track)
            logger.info("Video track added to peer connection")

    async def handle_offer(self, offer_sdp: dict) -> dict:
        """Handle WebRTC offer and create answer"""
        if not self.pc:
            await self.create_connection()
        
        # Add video track before creating answer
        await self.add_video_track()
        
        # Set remote description (offer)
        offer = RTCSessionDescription(sdp=offer_sdp["sdp"], type=offer_sdp["type"])
        await self.pc.setRemoteDescription(offer)
        logger.info("Remote description (offer) set")
        
        # Create answer
        answer = await self.pc.createAnswer()
        await self.pc.setLocalDescription(answer)
        logger.info("Local description (answer) set")
        
        # Return answer SDP
        return {
            "type": self.pc.localDescription.type,
            "sdp": self.pc.localDescription.sdp,
        }

    async def add_ice_candidate(self, candidate: dict) -> None:
        """Add ICE candidate from remote peer"""
        if self.pc:
            await self.pc.addIceCandidate(candidate)
            logger.debug("ICE candidate added")

    def set_data_channel_handler(self, handler: Callable) -> None:
        """Set handler for data channel messages"""
        self.on_data_channel_message = handler

    def _on_data_channel(self, channel) -> None:
        """Handle incoming data channel"""
        logger.info(f"Data channel opened: {channel.label}")
        self.data_channel = channel
        
        @channel.on("message")
        def on_message(message):
            if self.on_data_channel_message:
                asyncio.create_task(self.on_data_channel_message(message))

    async def _on_connection_state_change(self) -> None:
        """Handle connection state changes"""
        if self.pc:
            state = self.pc.connectionState
            logger.info(f"Connection state: {state}")
            
            if state == "failed" or state == "closed":
                await self.close()

    async def _on_ice_connection_state_change(self) -> None:
        """Handle ICE connection state changes"""
        if self.pc:
            state = self.pc.iceConnectionState
            logger.info(f"ICE connection state: {state}")

    async def change_quality(self, quality: str) -> None:
        """Change video quality"""
        logger.info(f"Changing quality to: {quality}")
        self.quality = quality
        
        if self.screen_capture:
            # Stop current capture
            await self.screen_capture.stop()
            
            # Create new capture with new quality
            self.screen_capture = ScreenCapture(quality=quality)
            await self.screen_capture.start()
            
            # Update video track
            if self.video_track:
                self.video_track.screen_capture = self.screen_capture
            
            logger.info(f"Quality changed to: {quality}")

    async def get_stats(self) -> dict:
        """Get WebRTC connection statistics"""
        if not self.pc:
            return {}
        
        stats = await self.pc.getStats()
        return {"stats": str(stats)}

    async def close(self) -> None:
        """Close peer connection and cleanup"""
        logger.info("Closing WebRTC peer connection")
        
        if self.screen_capture:
            await self.screen_capture.stop()
            self.screen_capture = None
        
        if self.pc:
            await self.pc.close()
            self.pc = None
        
        logger.info("WebRTC peer connection closed")
