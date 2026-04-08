/**
 * Signaling client for WebRTC connection setup
 */

import { io, Socket } from 'socket.io-client';
import { SignalingConfig, SessionInfo } from '../types';

export class SignalingClient {
  private socket: Socket | null = null;
  private config: SignalingConfig;
  private namespace: string;

  constructor(config: SignalingConfig) {
    this.config = config;
    this.namespace = config.namespace || '/client';
  }

  /**
   * Connect to signaling server
   */
  async connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.config.serverUrl + this.namespace, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
          console.log('Connected to signaling server');
          resolve(true);
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          reject(error);
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from signaling server');
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Join a streaming session
   */
  async joinSession(sessionId: string): Promise<{ success: boolean; session?: SessionInfo; message?: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to signaling server'));
        return;
      }

      this.socket.emit(
        'join-session',
        { sessionId },
        (response: { success: boolean; session?: SessionInfo; message?: string }) => {
          resolve(response);
        }
      );
    });
  }

  /**
   * Send WebRTC offer
   */
  sendOffer(sessionId: string, offer: RTCSessionDescriptionInit): void {
    if (!this.socket) {
      throw new Error('Not connected to signaling server');
    }
    this.socket.emit('offer', { sessionId, offer });
  }

  /**
   * Send ICE candidate
   */
  sendIceCandidate(sessionId: string, candidate: RTCIceCandidate): void {
    if (!this.socket) {
      throw new Error('Not connected to signaling server');
    }
    this.socket.emit('ice-candidate', { sessionId, candidate });
  }

  /**
   * Listen for WebRTC answer
   */
  onAnswer(callback: (answer: RTCSessionDescriptionInit) => void): void {
    if (!this.socket) {
      throw new Error('Not connected to signaling server');
    }
    this.socket.on('answer', (data: { answer: RTCSessionDescriptionInit }) => {
      callback(data.answer);
    });
  }

  /**
   * Listen for ICE candidates
   */
  onIceCandidate(callback: (candidate: RTCIceCandidateInit) => void): void {
    if (!this.socket) {
      throw new Error('Not connected to signaling server');
    }
    this.socket.on('ice-candidate', (data: { candidate: RTCIceCandidateInit }) => {
      callback(data.candidate);
    });
  }

  /**
   * Disconnect from signaling server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
