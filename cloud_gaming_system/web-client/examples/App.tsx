/**
 * Example App - Cloud Gaming Client Integration
 * Demonstrates how to use the cloud gaming components
 */

import React, { useState, useRef } from 'react';
import { StreamPlayer } from '../src/components/StreamPlayer';
import { InputHandler } from '../src/components/InputHandler';
import { useStreamConnection } from '../src/hooks/useStreamConnection';
import './App.css';

const App: React.FC = () => {
  const [sessionId, setSessionId] = useState('');
  const [signalingServer, setSignalingServer] = useState('http://localhost:3000');
  const [connected, setConnected] = useState(false);
  const [inputEnabled, setInputEnabled] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const streamPlayerRef = useRef<HTMLDivElement>(null);

  // Use the stream connection hook for custom control
  const {
    connected: streamConnected,
    connecting,
    error,
    sessionInfo,
    stats,
    videoRef,
    connect,
    disconnect,
    sendInput,
    changeQuality,
  } = useStreamConnection({
    signalingServerUrl: signalingServer,
    sessionId: sessionId,
    autoConnect: false,
  });

  const handleConnect = async () => {
    if (!sessionId) {
      alert('Please enter a session ID');
      return;
    }
    await connect();
  };

  const handleDisconnect = () => {
    disconnect();
    setConnected(false);
    setInputEnabled(false);
  };

  const handleInputToggle = () => {
    setInputEnabled(!inputEnabled);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Cloud Gaming Client</h1>
        <p>Connect to your gaming VM and start streaming</p>
      </header>

      <main className="main">
        {/* Connection Form */}
        <div className="connection-form">
          <div className="form-group">
            <label htmlFor="sessionId">Session ID:</label>
            <input
              id="sessionId"
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Enter session ID from VM"
              disabled={streamConnected}
            />
          </div>

          <div className="form-group">
            <label htmlFor="signalingServer">Signaling Server:</label>
            <input
              id="signalingServer"
              type="text"
              value={signalingServer}
              onChange={(e) => setSignalingServer(e.target.value)}
              placeholder="http://localhost:3000"
              disabled={streamConnected}
            />
          </div>

          <button
            onClick={showAdvanced ? () => setShowAdvanced(false) : () => setShowAdvanced(true)}
            className="toggle-advanced"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </button>

          {showAdvanced && (
            <div className="advanced-options">
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={inputEnabled}
                    onChange={handleInputToggle}
                    disabled={!streamConnected}
                  />
                  Enable Input Capture
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Stream Player - Simple Integration */}
        <div className="stream-section">
          <h2>Stream Player (Component)</h2>
          <StreamPlayer
            signalingServerUrl={signalingServer}
            sessionId={sessionId}
            autoConnect={false}
            showControls={true}
            showStats={true}
            onConnect={() => {
              setConnected(true);
              console.log('Connected!');
            }}
            onDisconnect={() => {
              setConnected(false);
              console.log('Disconnected!');
            }}
            onError={(err) => {
              console.error('Stream error:', err);
              alert(`Error: ${err}`);
            }}
          />
        </div>

        {/* Input Handler */}
        {streamConnected && (
          <InputHandler
            enabled={inputEnabled}
            onInput={sendInput}
            captureElement={streamPlayerRef}
            showGamepadStatus={true}
          />
        )}

        {/* Instructions */}
        <div className="instructions">
          <h3>How to Use:</h3>
          <ol>
            <li>Start your VM host service and note the session ID</li>
            <li>Enter the session ID above</li>
            <li>Verify the signaling server URL is correct</li>
            <li>Click "Connect" button on the stream player</li>
            <li>Once connected, enable input capture to control the VM</li>
            <li>Click on the video to lock the mouse cursor</li>
            <li>Use keyboard, mouse, or connect a gamepad to control</li>
          </ol>

          <h3>Controls:</h3>
          <ul>
            <li><strong>Keyboard & Mouse:</strong> Directly mapped to VM</li>
            <li><strong>Gamepad:</strong> Auto-detected when connected</li>
            <li><strong>Quality:</strong> Adjust based on your network speed</li>
            <li><strong>ESC:</strong> Release mouse lock</li>
          </ul>

          {sessionInfo && (
            <div className="session-details">
              <h3>Session Details:</h3>
              <p>VM ID: {sessionInfo.vmId}</p>
              <p>Status: {sessionInfo.status}</p>
              {sessionInfo.metadata?.hostname && (
                <p>Hostname: {sessionInfo.metadata.hostname}</p>
              )}
            </div>
          )}

          {stats && (
            <div className="stats-details">
              <h3>Connection Stats:</h3>
              <p>Latency: {stats.latency}ms</p>
              <p>Bitrate: {(stats.bitrate / 1000).toFixed(2)} Mbps</p>
              <p>FPS: {stats.frameRate}</p>
              <p>Resolution: {stats.resolution}</p>
              <p>Packet Loss: {stats.packetLoss}</p>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>Cloud Gaming Infrastructure - Phase 1</p>
      </footer>
    </div>
  );
};

export default App;
