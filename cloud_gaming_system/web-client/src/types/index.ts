/**
 * Type definitions for cloud gaming web client
 */

export interface GamepadState {
  connected: boolean;
  id: string;
  index: number;
  buttons: GamepadButton[];
  axes: number[];
  timestamp: number;
}

export interface StreamQuality {
  width: number;
  height: number;
  fps: number;
  bitrate: number;
}

export interface QualityPreset {
  name: 'high' | 'medium' | 'low';
  label: string;
  quality: StreamQuality;
}

export interface ConnectionStats {
  latency: number;
  bitrate: number;
  packetLoss: number;
  frameRate: number;
  resolution: string;
}

export interface InputEvent {
  type: 'mouse_move' | 'mouse_button' | 'mouse_wheel' | 'keyboard' | 'gamepad';
  data: any;
  timestamp: number;
}

export interface SessionInfo {
  sessionId: string;
  vmId: string;
  status: 'active' | 'connected' | 'disconnected';
  metadata?: {
    hostname?: string;
    capabilities?: {
      maxResolution: string;
      maxBitrate: number;
      codecs: string[];
    };
  };
}

export interface SignalingConfig {
  serverUrl: string;
  namespace?: string;
}

export interface WebRTCConfig {
  iceServers?: RTCIceServer[];
}
