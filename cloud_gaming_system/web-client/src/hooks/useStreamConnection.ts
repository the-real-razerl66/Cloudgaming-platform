/**
 * useStreamConnection Hook
 * Manages WebRTC connection and signaling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { SignalingClient } from '../utils/signalingClient';
import { WebRTCClient } from '../utils/webrtcClient';
import { SessionInfo, ConnectionStats } from '../types';

interface UseStreamConnectionProps {
  signalingServerUrl: string;
  sessionId: string;
  autoConnect?: boolean;
}

interface UseStreamConnectionReturn {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  sessionInfo: SessionInfo | null;
  stats: ConnectionStats | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendInput: (inputData: any) => void;
  changeQuality: (quality: 'high' | 'medium' | 'low') => void;
}

export const useStreamConnection = ({
  signalingServerUrl,
  sessionId,
  autoConnect = false,
}: UseStreamConnectionProps): UseStreamConnectionReturn => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [stats, setStats] = useState<ConnectionStats | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const signalingClient = useRef<SignalingClient | null>(null);
  const webrtcClient = useRef<WebRTCClient | null>(null);

  /**
   * Connect to stream
   */
  const connect = useCallback(async () => {
    try {
      setConnecting(true);
      setError(null);

      // Create signaling client
      signalingClient.current = new SignalingClient({
        serverUrl: signalingServerUrl,
      });

      // Connect to signaling server
      await signalingClient.current.connect();

      // Join session
      const joinResponse = await signalingClient.current.joinSession(sessionId);
      
      if (!joinResponse.success) {
        throw new Error(joinResponse.message || 'Failed to join session');
      }

      setSessionInfo(joinResponse.session || null);

      // Create WebRTC client
      webrtcClient.current = new WebRTCClient();
      const pc = webrtcClient.current.createConnection();

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && signalingClient.current) {
          signalingClient.current.sendIceCandidate(sessionId, event.candidate);
        }
      };

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log('Received remote track');
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle connection state
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          setConnected(true);
          setConnecting(false);
          // Start collecting stats
          webrtcClient.current?.startStats(setStats);
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          setConnected(false);
          setError('Connection failed');
        }
      };

      // Set up signaling handlers
      signalingClient.current.onAnswer(async (answer) => {
        console.log('Received answer');
        await webrtcClient.current?.setRemoteAnswer(answer);
      });

      signalingClient.current.onIceCandidate(async (candidate) => {
        console.log('Received ICE candidate');
        await webrtcClient.current?.addIceCandidate(candidate);
      });

      // Create and send offer
      const offer = await webrtcClient.current.createOffer();
      signalingClient.current.sendOffer(sessionId, offer);

    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
      setConnecting(false);
    }
  }, [signalingServerUrl, sessionId]);

  /**
   * Disconnect from stream
   */
  const disconnect = useCallback(() => {
    if (webrtcClient.current) {
      webrtcClient.current.close();
      webrtcClient.current = null;
    }

    if (signalingClient.current) {
      signalingClient.current.disconnect();
      signalingClient.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setConnected(false);
    setConnecting(false);
    setSessionInfo(null);
    setStats(null);
  }, []);

  /**
   * Send input data
   */
  const sendInput = useCallback((inputData: any) => {
    webrtcClient.current?.sendInput(inputData);
  }, []);

  /**
   * Change stream quality
   */
  const changeQuality = useCallback((quality: 'high' | 'medium' | 'low') => {
    webrtcClient.current?.requestQualityChange(quality);
  }, []);

  /**
   * Auto-connect on mount if enabled
   */
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, []);

  return {
    connected,
    connecting,
    error,
    sessionInfo,
    stats,
    videoRef,
    connect,
    disconnect,
    sendInput,
    changeQuality,
  };
};
