"""Main entry point for VM host capture service"""

import asyncio
import signal
import sys
from typing import Optional
import json
from .config import config
from .logger import logger
from .signaling_client import SignalingClient
from .webrtc_peer import WebRTCPeer
from .input_handler import InputHandler


class VMHostService:
    """Main VM host service orchestrator"""

    def __init__(self):
        self.signaling_client: Optional[SignalingClient] = None
        self.webrtc_peer: Optional[WebRTCPeer] = None
        self.input_handler: Optional[InputHandler] = None
        self.running = False
        logger.info("VM Host Service initialized")

    async def start(self) -> None:
        """Start the VM host service"""
        logger.info("="*60)
        logger.info("Starting Cloud Gaming VM Host Service")
        logger.info("="*60)
        
        try:
            # Initialize components
            self.signaling_client = SignalingClient()
            self.input_handler = InputHandler()
            
            # Set up signaling handlers
            self.signaling_client.set_offer_handler(self._handle_offer)
            self.signaling_client.set_ice_candidate_handler(self._handle_ice_candidate)
            
            # Connect to signaling server
            connected = await self.signaling_client.connect_to_server()
            
            if not connected:
                logger.error("Failed to connect to signaling server")
                return
            
            logger.info("VM host service started successfully")
            logger.info("Waiting for client connections...")
            
            self.running = True
            
            # Keep running
            while self.running:
                await asyncio.sleep(1)
                
        except Exception as e:
            logger.error(f"Error starting VM host service: {e}", exc_info=True)
            raise

    async def _handle_offer(self, data: dict) -> None:
        """Handle WebRTC offer from client"""
        try:
            session_id = data.get("sessionId")
            offer = data.get("offer")
            
            logger.info(f"Handling offer for session: {session_id}")
            
            # Create WebRTC peer if not exists
            if not self.webrtc_peer:
                quality = config.get("bitrate.initial", "high")
                self.webrtc_peer = WebRTCPeer(session_id, quality=quality)
                
                # Set up data channel handler for input
                self.webrtc_peer.set_data_channel_handler(self._handle_data_channel_message)
            
            # Handle offer and create answer
            answer = await self.webrtc_peer.handle_offer(offer)
            
            # Send answer back to client
            await self.signaling_client.send_answer(answer)
            
            logger.info("Offer handled, answer sent to client")
            
        except Exception as e:
            logger.error(f"Error handling offer: {e}", exc_info=True)

    async def _handle_ice_candidate(self, data: dict) -> None:
        """Handle ICE candidate from client"""
        try:
            candidate = data.get("candidate")
            
            if self.webrtc_peer and candidate:
                await self.webrtc_peer.add_ice_candidate(candidate)
        except Exception as e:
            logger.error(f"Error handling ICE candidate: {e}")

    async def _handle_data_channel_message(self, message: str) -> None:
        """Handle messages from WebRTC data channel"""
        try:
            data = json.loads(message) if isinstance(message, str) else message
            
            message_type = data.get("type")
            
            if message_type == "input":
                # Handle input events
                input_data = data.get("data")
                if input_data and self.input_handler:
                    await self.input_handler.handle_input(input_data)
            
            elif message_type == "quality_change":
                # Handle quality change request
                quality = data.get("quality", "high")
                logger.info(f"Quality change requested: {quality}")
                if self.webrtc_peer:
                    await self.webrtc_peer.change_quality(quality)
            
            elif message_type == "stats_request":
                # Handle stats request
                if self.webrtc_peer:
                    stats = await self.webrtc_peer.get_stats()
                    # Send stats back (would need data channel send capability)
                    logger.debug(f"Stats: {stats}")
            
            else:
                logger.warning(f"Unknown message type: {message_type}")
                
        except Exception as e:
            logger.error(f"Error handling data channel message: {e}")

    async def stop(self) -> None:
        """Stop the VM host service"""
        logger.info("Stopping VM host service...")
        self.running = False
        
        # Clean up WebRTC peer
        if self.webrtc_peer:
            await self.webrtc_peer.close()
            self.webrtc_peer = None
        
        # Disconnect from signaling server
        if self.signaling_client:
            await self.signaling_client.disconnect()
            self.signaling_client = None
        
        logger.info("VM host service stopped")


async def main():
    """Main entry point"""
    service = VMHostService()
    
    # Set up signal handlers for graceful shutdown
    def signal_handler(sig, frame):
        logger.info(f"Received signal {sig}, shutting down...")
        asyncio.create_task(service.stop())
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        await service.start()
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received")
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)
    finally:
        await service.stop()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Service terminated by user")
    except Exception as e:
        logger.error(f"Service crashed: {e}", exc_info=True)
        sys.exit(1)
