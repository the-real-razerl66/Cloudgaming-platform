# Cloud Gaming Streaming Infrastructure

## Overview

A complete cloud gaming streaming infrastructure built with WebRTC, designed to solve major cloud gaming problems including network speed optimization, device compatibility, and low-latency streaming.

## Features

- **Low-Latency WebRTC Streaming**: Sub-100ms latency for real-time gaming
- **Adaptive Quality**: Automatic quality adjustment (1080p60, 720p60, 540p60)
- **Cloudflare CDN Integration**: Global edge network for optimized delivery
- **Universal Device Support**: Works on any device with a web browser
- **Controller Support**: Automatic gamepad detection and input translation
- **Encrypted Transmission**: Secure video and data transmission
- **Phone Home System**: VMs automatically register with unique session IDs
- **Multi-VM Support**: Handle multiple simultaneous gaming sessions

## Architecture

```
┌─────────────────┐     Phone Home      ┌──────────────────┐
│   Gaming VM     │ ─────────────────> │ Signaling Server │
│  (VM Host)      │                     │   (Node.js)      │
└────────┬────────┘                     └────────┬─────────┘
         │                                       │
         │         WebRTC Signaling              │
         │ <─────────────────────────────────> │
         │                                       │
    Video Stream                                 │
         │                                   Join Session
         │                                       │
         └──────────────────────> ┌────────────▼─────────┐
                                   │   Web Client         │
                Cloudflare CDN     │   (React/Browser)    │
                    (Optional)     └──────────────────────┘
```

## Components

### 1. Signaling Server
- **Technology**: Node.js, TypeScript, Express, Socket.IO
- **Purpose**: WebRTC signaling and session management
- **Features**: VM registration, session tracking, offer/answer exchange

### 2. VM Host Capture Service
- **Technology**: Python, aiortc, FFmpeg
- **Purpose**: Screen capture and streaming from Linux VMs
- **Features**: Adaptive bitrate, input injection, phone home registration

### 3. Web Client
- **Technology**: React, TypeScript
- **Purpose**: Browser-based gaming client
- **Features**: WebRTC player, controller support, quality controls

## Quick Start

### 1. Deploy Signaling Server

```bash
cd signaling-server
npm install
cp .env.example .env
# Edit .env with your configuration
npm run build
npm start
```

### 2. Install VM Host Service

```bash
cd vm-host-linux
sudo ./install.sh
# Edit /opt/cloud-gaming-vm-host/.env
sudo systemctl start vm-host
sudo systemctl enable vm-host
```

### 3. Deploy Web Client

```bash
cd web-client
npm install
npm run dev
# For production: npm run build
```

### 4. Connect and Play

1. VM will display its session ID on startup
2. Open web client and enter the session ID
3. Click "Connect" and start playing!

## Documentation

- [Architecture Guide](./ARCHITECTURE.md) - Detailed system architecture
- [Signaling Server Setup](./SETUP_SIGNALING_SERVER.md) - Deploy the signaling server
- [VM Host Setup](./SETUP_VM_HOST.md) - Install on Linux gaming VMs
- [Web Client Integration](./SETUP_WEB_CLIENT.md) - Integrate React components
- [Cloudflare Setup](./CLOUDFLARE_SETUP.md) - CDN configuration guide
- [API Reference](./API_REFERENCE.md) - Complete API documentation
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions

## System Requirements

### Signaling Server
- Node.js 18+
- 1GB RAM minimum
- Public IP or domain

### VM Host (Linux)
- Ubuntu 20.04+ or similar
- X11 display server
- FFmpeg installed
- Python 3.8+
- 2GB RAM minimum
- GPU recommended for gaming

### Web Client
- Modern web browser (Chrome, Firefox, Safari, Edge)
- WebRTC support
- Stable internet connection (5+ Mbps recommended)

## Network Requirements

- **Good Connection**: 1080p60 @ 8 Mbps
- **Medium Connection**: 720p60 @ 4 Mbps
- **Poor Connection**: 540p60 @ 2 Mbps

## Security Features

- HTTPS/WSS for all connections (production)
- DTLS-SRTP encryption for WebRTC streams
- Session-based authentication
- CORS protection
- Helmet security headers

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or contributions, please refer to the documentation or create an issue in the repository.

## Roadmap

**Phase 1** (Current):
- ✅ WebRTC streaming infrastructure
- ✅ Signaling server
- ✅ Linux VM host
- ✅ Web client components
- ✅ Basic input handling

**Phase 2** (Future):
- Audio streaming support
- Windows VM host support
- Mobile app clients
- Advanced network optimization
- Recording and replay features
- Multi-user spectator mode
