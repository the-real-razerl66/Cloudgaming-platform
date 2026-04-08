"""WebSocket signaling client for connecting to signaling server"""

import asyncio
import json
import socket as sock
from typing import Optional, Callable
import socketio
from .config import config
from .logger import logger


class SignalingClient:
    """WebSocket client for signaling server communication"""

    def __init__(self):
        self.sio = socketio.AsyncClient(logger=False, engineio_logger=False)
        self.session_id: Optional[str] = None
        self.connected = False
        self.on_offer: Optional[Callable] = None
        self.on_ice_candidate: Optional[Callable] = None
        
        # Get configuration
        self.server_url = config.get("signaling.url", "http://localhost:3000")
        self.namespace = config.get("signaling.namespace", "/vm")
        self.vm_id = config.get("vm.id", "vm-001")
        self.hostname = config.get("vm.hostname", sock.gethostname())
        
        self._setup_event_handlers()
        logger.info(f"Signaling client initialized for VM: {self.vm_id}")

    def _setup_event_handlers(self) -> None:
        """Set up Socket.IO event handlers"""
        
        @self.sio.event(namespace=self.namespace)
        async def connect():
            logger.info("Connected to signaling server")
            self.connected = True
            await self._register_vm()
        
        @self.sio.event(namespace=self.namespace)
        async def disconnect():
            logger.warning("Disconnected from signaling server")
            self.connected = False
        
        @self.sio.event(namespace=self.namespace)
        async def connect_error(data):
            logger.error(f"Connection error: {data}")
        
        @self.sio.on("offer", namespace=self.namespace)
        async def on_offer(data):
            logger.info("Received offer from client")
            if self.on_offer:
                await self.on_offer(data)
        
        @self.sio.on("ice-candidate", namespace=self.namespace)
        async def on_ice_candidate(data):
            logger.debug("Received ICE candidate from client")
            if self.on_ice_candidate:
                await self.on_ice_candidate(data)

    async def connect_to_server(self) -> bool:
        """Connect to signaling server"""
        try:
            logger.info(f"Connecting to signaling server: {self.server_url}")
            await self.sio.connect(
                self.server_url,
                namespaces=[self.namespace],
                transports=["websocket", "polling"],
            )
            return True
        except Exception as e:
            logger.error(f"Failed to connect to signaling server: {e}")
            return False

    async def _register_vm(self) -> None:
        """Register VM with signaling server (phone home)"""
        try:
            # Get VM capabilities
            preset = config.get_quality_preset("high")
            capabilities = {
                "maxResolution": f"{preset['width']}x{preset['height']}",
                "maxBitrate": preset['bitrate'],
                "codecs": ["H264", "VP8"],
            }
            
            # Get local IP
            try:
                local_ip = sock.gethostbyname(sock.gethostname())
            except:
                local_ip = "unknown"
            
            # Register with server
            response = await self.sio.call(
                "register",
                {
                    "vmId": self.vm_id,
                    "hostname": self.hostname,
                    "ip": local_ip,
                    "capabilities": capabilities,
                },
                namespace=self.namespace,
                timeout=10,
            )
            
            if response.get("success"):
                self.session_id = response.get("sessionId")
                logger.info(f"VM registered successfully! Session ID: {self.session_id}")
                logger.info(f"Clients can connect using session ID: {self.session_id}")
                
                # Start heartbeat
                asyncio.create_task(self._heartbeat_loop())
            else:
                logger.error(f"VM registration failed: {response.get('message')}")
        except Exception as e:
            logger.error(f"Failed to register VM: {e}")

    async def _heartbeat_loop(self) -> None:
        """Send periodic heartbeat to signaling server"""
        interval = config.get("heartbeat.interval", 30)
        
        while self.connected and self.session_id:
            try:
                await asyncio.sleep(interval)
                
                response = await self.sio.call(
                    "heartbeat",
                    {"sessionId": self.session_id},
                    namespace=self.namespace,
                    timeout=5,
                )
                
                if not response.get("success"):
                    logger.warning("Heartbeat failed, session may be invalid")
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Heartbeat error: {e}")

    async def send_answer(self, answer: dict) -> None:
        """Send WebRTC answer to client"""
        if not self.session_id:
            logger.error("Cannot send answer: no session ID")
            return
        
        try:
            await self.sio.emit(
                "answer",
                {"sessionId": self.session_id, "answer": answer},
                namespace=self.namespace,
            )
            logger.info("Answer sent to client")
        except Exception as e:
            logger.error(f"Failed to send answer: {e}")

    async def send_ice_candidate(self, candidate: dict) -> None:
        """Send ICE candidate to client"""
        if not self.session_id:
            logger.error("Cannot send ICE candidate: no session ID")
            return
        
        try:
            await self.sio.emit(
                "ice-candidate",
                {"sessionId": self.session_id, "candidate": candidate},
                namespace=self.namespace,
            )
            logger.debug("ICE candidate sent to client")
        except Exception as e:
            logger.error(f"Failed to send ICE candidate: {e}")

    def set_offer_handler(self, handler: Callable) -> None:
        """Set handler for incoming offers"""
        self.on_offer = handler

    def set_ice_candidate_handler(self, handler: Callable) -> None:
        """Set handler for incoming ICE candidates"""
        self.on_ice_candidate = handler

    async def disconnect(self) -> None:
        """Disconnect from signaling server"""
        logger.info("Disconnecting from signaling server")
        await self.sio.disconnect()
        self.connected = False
