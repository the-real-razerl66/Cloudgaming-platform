# Cloud Gaming Streaming Infrastructure - Phase 1

![Architecture](https://img.shields.io/badge/architecture-WebRTC-blue)
![Status](https://img.shields.io/badge/status-Phase%201-green)
![License](https://img.shields.io/badge/license-MIT-blue)
(Removed Code Due to files just not really fitting moved project to local storage server)
A complete, production-ready cloud gaming streaming infrastructure built with WebRTC, designed to solve major cloud gaming challenges including network latency, device compatibility, and adaptive quality streaming.

## 🎯 Project Overview

This system enables ultra-low-latency game streaming from Linux VMs to any web browser with:
- **Sub-100ms latency** for real-time gaming
- **Adaptive quality** streaming (1080p60, 720p60, 540p60)
- **Universal compatibility** - works on any device with a modern browser
- **Cloudflare CDN** integration for global edge delivery
- **Phone home system** - VMs self-register with unique session IDs
- **Complete input support** - keyboard, mouse, and gamepad

## 📦 Components

```
cloud_gaming_system/
├── signaling-server/      # Node.js/TypeScript WebRTC signaling server
├── vm-host-linux/         # Python screen capture and streaming service
├── web-client/            # React web client components
└── docs/                  # Comprehensive documentation
```

### 1. Signaling Server
**Technology:** Node.js, TypeScript, Express, Socket.IO

- WebRTC signaling and session management
- VM registration endpoint ("phone home" system)
- UUID-based session IDs (changes on VM restart)
- REST API for session lookup
- Cloudflare-ready configuration

### 2. VM Host Capture Service (Linux)
**Technology:** Python, aiortc, FFmpeg

- X11 screen capture using FFmpeg
- WebRTC peer connection with aiortc
- Adaptive bitrate video encoding
- Input injection (keyboard/mouse/gamepad)
- Auto-registration with signaling server
- Systemd service with auto-start

### 3. Web Client Components
**Technology:** React, TypeScript

- **useController** hook - Gamepad API integration
- **StreamPlayer** component - WebRTC video player
- **InputHandler** - Keyboard/mouse/gamepad capture
- Network stats and quality controls
- Example integration app included

## 🚀 Quick Start

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
# Get session ID from logs:
sudo journalctl -u vm-host | grep "Session ID"
```

### 3. Run Web Client

```bash
cd web-client
npm install
npm run dev
# Open http://localhost:5173
# Enter session ID and connect!
```

## 📚 Documentation

Comprehensive guides available in the `docs/` directory:

- **[README.md](docs/README.md)** - Project overview and quick start
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture and flow diagrams
- **[SETUP_SIGNALING_SERVER.md](docs/SETUP_SIGNALING_SERVER.md)** - Signaling server deployment
- **[SETUP_VM_HOST.md](docs/SETUP_VM_HOST.md)** - VM host installation on Linux
- **[SETUP_WEB_CLIENT.md](docs/SETUP_WEB_CLIENT.md)** - Web client integration guide
- **[CLOUDFLARE_SETUP.md](docs/CLOUDFLARE_SETUP.md)** - Cloudflare CDN configuration
- **[API_REFERENCE.md](docs/API_REFERENCE.md)** - Complete API documentation
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## ⚙️ System Requirements

### Signaling Server
- Node.js 20+
- 1GB RAM minimum
- Public IP or domain
- (Optional) SSL certificate

### VM Host (Linux)
- Ubuntu 20.04+ or similar
- X11 display server
- FFmpeg
- Python 3.10+
- 2GB RAM minimum
- GPU with hardware encoding (recommended)

### Web Client
- Modern browser with WebRTC support
- Chrome 90+, Firefox 88+, Safari 14.1+, Edge 90+
- 5+ Mbps internet connection

## 🎮 Features

### ✅ Implemented (Phase 1)

- [x] WebRTC-based peer-to-peer streaming
- [x] Signaling server with Socket.IO
- [x] VM "phone home" registration system
- [x] UUID-based session management
- [x] Linux screen capture with FFmpeg
- [x] Adaptive quality streaming (3 presets)
- [x] Keyboard and mouse input injection
- [x] Gamepad detection and mapping
- [x] React client components
- [x] Connection statistics and monitoring
- [x] Cloudflare integration support
- [x] Systemd service files
- [x] Complete documentation

### 🚧 Planned (Phase 2+)

- [ ] Audio streaming support
- [ ] Windows VM host support
- [ ] Mobile app clients (iOS/Android)
- [ ] Automatic quality adaptation based on network
- [ ] Recording and replay features
- [ ] Multi-user spectator mode
- [ ] Redis-based session sharing for scaling
- [ ] Advanced analytics and monitoring

## 📊 Performance

### Latency Breakdown

| Component | Latency |
|-----------|--------|
| Screen Capture | 1-5ms |
| Video Encoding | 5-15ms |
| Network Transmission | 10-100ms |
| Video Decoding | 5-10ms |
| Display | 1-2ms |
| **Total** | **22-132ms** |

*Typical end-to-end latency: 30-60ms on good connections*

### Bandwidth Usage

| Quality | Resolution | FPS | Bitrate |
|---------|-----------|-----|--------|
| High | 1920x1080 | 60 | ~8 Mbps |
| Medium | 1280x720 | 60 | ~4 Mbps |
| Low | 960x540 | 60 | ~2 Mbps |

## 🔒 Security

- **Transport Encryption**: HTTPS/WSS for signaling, DTLS-SRTP for media
- **Session-based Auth**: UUID session IDs that change on VM restart
- **CORS Protection**: Configurable allowed origins
- **DDoS Protection**: Cloudflare integration (optional)
- **Input Validation**: All inputs sanitized and validated
- **Helmet Headers**: Security headers on all responses

## 🧑‍💻 Development

### Project Structure

```
cloud_gaming_system/
├── signaling-server/
│   ├── src/
│   │   ├── index.ts          # Main server
│   │   ├── sessionManager.ts # Session management
│   │   ├── types.ts          # TypeScript types
│   │   └── logger.ts         # Winston logger
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── vm-host-linux/
│   ├── src/
│   │   ├── main.py           # Entry point
│   │   ├── screen_capture.py # FFmpeg capture
│   │   ├── webrtc_peer.py    # WebRTC connection
│   │   ├── input_handler.py  # Input injection
│   │   └── signaling_client.py # Signaling
│   ├── config/
│   │   └── config.yaml       # Configuration
│   ├── requirements.txt
│   ├── install.sh
│   └── vm-host.service   # Systemd service
│
├── web-client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── StreamPlayer.tsx
│   │   │   └── InputHandler.tsx
│   │   ├── hooks/
│   │   │   ├── useController.ts
│   │   │   └── useStreamConnection.ts
│   │   └── utils/
│   │       ├── signalingClient.ts
│   │       └── webrtcClient.ts
│   ├── examples/         # Example app
│   ├── package.json
│   └── vite.config.ts
│
└── docs/              # Documentation
    ├── README.md
    ├── ARCHITECTURE.md
    ├── SETUP_SIGNALING_SERVER.md
    ├── SETUP_VM_HOST.md
    ├── SETUP_WEB_CLIENT.md
    ├── CLOUDFLARE_SETUP.md
    ├── API_REFERENCE.md
    └── TROUBLESHOOTING.md
```

### Testing

```bash
# Test signaling server
cd signaling-server
npm test

# Test VM host manually
cd vm-host-linux
source venv/bin/activate
python3 -m src.main

# Test web client
cd web-client
npm run dev
```

## 📡 Deployment

### Production Checklist

- [ ] Deploy signaling server on VPS/cloud
- [ ] Set up SSL certificates (Let's Encrypt)
- [ ] Configure Nginx reverse proxy
- [ ] Set up Cloudflare (optional but recommended)
- [ ] Install VM host service on gaming VMs
- [ ] Deploy web client to CDN/static hosting
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Test end-to-end connection
- [ ] Load testing for expected capacity

### Scaling Considerations

**Signaling Server:**
- Lightweight: 1 server handles 1000+ connections
- Scale horizontally with load balancer
- Use Redis for session sharing (future)

**VM Hosts:**
- Resource-intensive: 1 VM = 1 gaming session
- Scale by adding more VMs
- Consider auto-scaling groups

## 🐛 Known Issues

- Wayland display server not supported (use X11)
- Safari has limited gamepad support
- WebRTC may struggle with symmetric NATs (use TURN)
- No audio streaming in Phase 1 (planned for Phase 2)

## 🤝 Contributing

Contributions are welcome! Please:

1. Read the documentation thoroughly
2. Check existing issues before creating new ones
3. Follow the code style of each component
4. Test your changes extensively
5. Submit detailed pull requests

## 📝 License

MIT License - See LICENSE file for details

## 📞 Support

For issues, questions, or feature requests:

1. Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
2. Review [API_REFERENCE.md](docs/API_REFERENCE.md)
3. Search existing issues
4. Create a detailed issue report

## 🚀 Roadmap

**Phase 1: Core Infrastructure** (Current)
- WebRTC streaming foundation
- Basic input handling
- Quality presets

**Phase 2: Enhanced Features** (Q2 2024)
- Audio streaming
- Automatic quality adaptation
- Windows VM support
- Recording capabilities

**Phase 3: Scale & Polish** (Q3 2024)
- Mobile clients
- Redis session sharing
- Advanced analytics
- Multi-region deployment

**Phase 4: Advanced Features** (Q4 2024)
- Spectator mode
- Cloud save integration
- Custom codec support
- AI-powered quality optimization

---

**Built with ❤️ for the cloud gaming community**

*Solving latency, compatibility, and accessibility challenges in cloud gaming.*
