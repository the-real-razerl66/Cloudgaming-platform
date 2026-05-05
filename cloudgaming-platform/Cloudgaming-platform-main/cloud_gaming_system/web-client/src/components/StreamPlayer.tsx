/**
 * StreamPlayer Component
 * WebRTC video player with adaptive quality controls
 */

import React, { useState } from 'react';
import { useStreamConnection } from '../hooks/useStreamConnection';
import './StreamPlayer.css';

interface StreamPlayerProps {
  signalingServerUrl: string;
  sessionId: string;
  autoConnect?: boolean;
  showControls?: boolean;
  showStats?: boolean;
  className?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
}

export const StreamPlayer: React.FC<StreamPlayerProps> = ({
  signalingServerUrl,
  sessionId,
  autoConnect = false,
  showControls = true,
  showStats = true,
  className = '',
  onConnect,
  onDisconnect,
  onError,
}) => {
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');
  
  const {
    connected,
    connecting,
    error,
    sessionInfo,
    stats,
    videoRef,
    connect,
    disconnect,
    changeQuality,
  } = useStreamConnection({
    signalingServerUrl,
    sessionId,
    autoConnect,
  });

  // Handle connection
  const handleConnect = async () => {
    await connect();
    onConnect?.();
  };

  // Handle disconnection
  const handleDisconnect = () => {
    disconnect();
    onDisconnect?.();
  };

  // Handle quality change
  const handleQualityChange = (newQuality: 'high' | 'medium' | 'low') => {
    setQuality(newQuality);
    changeQuality(newQuality);
  };

  // Handle errors
  React.useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  return (
    <div className={`stream-player ${className}`}>
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={false}
          className="video-element"
        />
        
        {/* Connection overlay */}
        {!connected && (
          <div className="connection-overlay">
            {connecting ? (
              <div className="connecting">
                <div className="spinner" />
                <p>Connecting to session...</p>
              </div>
            ) : (
              <div className="not-connected">
                <h3>Not Connected</h3>
                <p>Session ID: {sessionId}</p>
                {error && <p className="error">{error}</p>}
                <button onClick={handleConnect} className="connect-button">
                  Connect
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stats overlay */}
        {showStats && connected && stats && (
          <div className="stats-overlay">
            <div className="stat">
              <span className="label">Latency:</span>
              <span className="value">{stats.latency}ms</span>
            </div>
            <div className="stat">
              <span className="label">Bitrate:</span>
              <span className="value">{(stats.bitrate / 1000).toFixed(1)} Mbps</span>
            </div>
            <div className="stat">
              <span className="label">FPS:</span>
              <span className="value">{stats.frameRate}</span>
            </div>
            <div className="stat">
              <span className="label">Resolution:</span>
              <span className="value">{stats.resolution}</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="controls">
          <div className="quality-controls">
            <label>Quality:</label>
            <button
              onClick={() => handleQualityChange('high')}
              className={quality === 'high' ? 'active' : ''}
              disabled={!connected}
            >
              High (1080p60)
            </button>
            <button
              onClick={() => handleQualityChange('medium')}
              className={quality === 'medium' ? 'active' : ''}
              disabled={!connected}
            >
              Medium (720p60)
            </button>
            <button
              onClick={() => handleQualityChange('low')}
              className={quality === 'low' ? 'active' : ''}
              disabled={!connected}
            >
              Low (540p60)
            </button>
          </div>

          <div className="connection-controls">
            {connected ? (
              <button onClick={handleDisconnect} className="disconnect-button">
                Disconnect
              </button>
            ) : (
              <button onClick={handleConnect} className="connect-button" disabled={connecting}>
                {connecting ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Session info */}
      {sessionInfo && (
        <div className="session-info">
          <p>VM: {sessionInfo.vmId}</p>
          {sessionInfo.metadata?.hostname && (
            <p>Host: {sessionInfo.metadata.hostname}</p>
          )}
        </div>
      )}
    </div>
  );
};
