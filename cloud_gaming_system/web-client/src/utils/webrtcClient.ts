/**
 * WebRTC client for video streaming and data channel communication
 */

import { WebRTCConfig, ConnectionStats } from '../types';

export class WebRTCClient {
  private pc: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private config: WebRTCConfig;
  private statsInterval: number | null = null;
  private onStatsUpdate?: (stats: ConnectionStats) => void;

  constructor(config: WebRTCConfig = {}) {
    this.config = config;
  }

  /**
   * Create peer connection
   */
  createConnection(): RTCPeerConnection {
    const defaultIceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ];

    this.pc = new RTCPeerConnection({
      iceServers: this.config.iceServers || defaultIceServers,
    });

    // Create data channel for input
    this.dataChannel = this.pc.createDataChannel('input', {
      ordered: false,
      maxRetransmits: 0,
    });

    this.dataChannel.onopen = () => {
      console.log('Data channel opened');
    };

    this.dataChannel.onclose = () => {
      console.log('Data channel closed');
    };

    this.dataChannel.onerror = (error) => {
      console.error('Data channel error:', error);
    };

    return this.pc;
  }

  /**
   * Get peer connection
   */
  getPeerConnection(): RTCPeerConnection | null {
    return this.pc;
  }

  /**
   * Create and send offer
   */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.pc) {
      throw new Error('Peer connection not created');
    }

    const offer = await this.pc.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: true,
    });

    await this.pc.setLocalDescription(offer);
    return offer;
  }

  /**
   * Set remote answer
   */
  async setRemoteAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.pc) {
      throw new Error('Peer connection not created');
    }

    await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
  }

  /**
   * Add ICE candidate
   */
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.pc) {
      throw new Error('Peer connection not created');
    }

    await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  /**
   * Send data through data channel
   */
  sendData(data: any): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.warn('Data channel not ready');
      return;
    }

    const message = typeof data === 'string' ? data : JSON.stringify(data);
    this.dataChannel.send(message);
  }

  /**
   * Send input event
   */
  sendInput(inputData: any): void {
    this.sendData({
      type: 'input',
      data: inputData,
      timestamp: Date.now(),
    });
  }

  /**
   * Request quality change
   */
  requestQualityChange(quality: 'high' | 'medium' | 'low'): void {
    this.sendData({
      type: 'quality_change',
      quality,
      timestamp: Date.now(),
    });
  }

  /**
   * Start collecting statistics
   */
  startStats(callback: (stats: ConnectionStats) => void, interval: number = 1000): void {
    this.onStatsUpdate = callback;

    this.statsInterval = window.setInterval(async () => {
      if (!this.pc) return;

      try {
        const stats = await this.pc.getStats();
        const connectionStats = this.parseStats(stats);
        if (this.onStatsUpdate) {
          this.onStatsUpdate(connectionStats);
        }
      } catch (error) {
        console.error('Error getting stats:', error);
      }
    }, interval);
  }

  /**
   * Parse WebRTC stats
   */
  private parseStats(stats: RTCStatsReport): ConnectionStats {
    let latency = 0;
    let bitrate = 0;
    let packetLoss = 0;
    let frameRate = 0;
    let resolution = 'N/A';

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.kind === 'video') {
        bitrate = Math.round((report.bytesReceived * 8) / 1000); // kbps
        frameRate = report.framesPerSecond || 0;
        packetLoss = report.packetsLost || 0;
      }

      if (report.type === 'track' && report.kind === 'video') {
        resolution = `${report.frameWidth}x${report.frameHeight}`;
      }

      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        latency = report.currentRoundTripTime ? report.currentRoundTripTime * 1000 : 0;
      }
    });

    return {
      latency: Math.round(latency),
      bitrate,
      packetLoss,
      frameRate: Math.round(frameRate),
      resolution,
    };
  }

  /**
   * Stop collecting statistics
   */
  stopStats(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }

  /**
   * Close connection
   */
  close(): void {
    this.stopStats();

    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
  }
}
