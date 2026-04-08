# Cloudflare Setup Guide

## Overview

Cloudflare provides CDN, DDoS protection, and global edge network capabilities for the cloud gaming infrastructure. This guide covers setting up Cloudflare for optimal performance.

## Prerequisites

- Cloudflare account (free or paid)
- Domain name added to Cloudflare
- Signaling server deployed with public IP or domain

## Step 1: Add Your Domain to Cloudflare

### 1. Sign up for Cloudflare

Visit [cloudflare.com](https://www.cloudflare.com) and create an account.

### 2. Add Your Site

1. Click "Add a Site"
2. Enter your domain name
3. Select a plan (Free plan works for basic setup)
4. Cloudflare will scan your DNS records

### 3. Update Nameservers

1. Copy the Cloudflare nameservers provided
2. Update nameservers at your domain registrar
3. Wait for DNS propagation (up to 24 hours)

## Step 2: Configure DNS Records

### For Signaling Server

Add DNS record:

```
Type: A
Name: signaling
IPv4 address: YOUR_SERVER_IP
Proxy status: Proxied (orange cloud)
TTL: Auto
```

Result: `signaling.yourdomain.com` points to your server through Cloudflare.

### For Web Client (if self-hosted)

```
Type: A
Name: gaming (or @)
IPv4 address: YOUR_WEB_SERVER_IP
Proxy status: Proxied
TTL: Auto
```

## Step 3: SSL/TLS Configuration

### 1. Set SSL/TLS Mode

Go to **SSL/TLS** > **Overview**:

- Select **Full (strict)** for best security
- Requires valid SSL certificate on origin server

### 2. Enable Always Use HTTPS

Go to **SSL/TLS** > **Edge Certificates**:

- Enable "Always Use HTTPS"
- Enable "Automatic HTTPS Rewrites"

### 3. Minimum TLS Version

Set to **TLS 1.2** for compatibility.

## Step 4: WebSocket Configuration

### Enable WebSockets

Cloudflare supports WebSockets by default, but verify:

1. Go to **Network**
2. Ensure **WebSockets** is enabled

### WebSocket Timeout

Cloudflare's default WebSocket timeout is **100 seconds**. For gaming:

**Free Plan**: 100s timeout (sufficient for short disconnections)  
**Paid Plans**: Contact support for longer timeouts if needed

Implement heartbeat in your code (already included) to keep connection alive.

## Step 5: Performance Optimization

### 1. Enable Caching for Static Assets

Go to **Caching** > **Configuration**:

**Page Rules** for web client:
```
URL: gaming.yourdomain.com/assets/*
Settings:
  - Cache Level: Standard
  - Browser Cache TTL: 1 month
```

### 2. Enable Brotli Compression

Go to **Speed** > **Optimization**:

- Enable **Brotli**
- Enable **Auto Minify** (HTML, CSS, JS)

### 3. Enable HTTP/2

Go to **Network**:

- Enable **HTTP/2**
- Enable **HTTP/3 (QUIC)** if available

### 4. Argo Smart Routing (Paid)

For lowest latency:

1. Go to **Traffic** > **Argo**
2. Enable **Argo Smart Routing**
3. Cost: ~$5/month + $0.10/GB

**Benefits**:
- 30% faster on average
- Intelligent routing through Cloudflare network
- Recommended for gaming

## Step 6: Security Configuration

### 1. Firewall Rules

Go to **Security** > **WAF**:

**Allow signaling server connections**:
```
Field: URI Path
Operator: contains
Value: /socket.io/
Action: Allow
```

**Rate limiting** (paid feature):
```
Path: /api/*
Requests: 100 per minute
Action: Block
```

### 2. DDoS Protection

Enabled by default. Configure in **Security** > **DDoS**:

- Set sensitivity to **High** for gaming
- Enable **HTTP DDoS Attack Protection**

### 3. Bot Protection

Go to **Security** > **Bots**:

- Enable **Bot Fight Mode** (free)
- Or **Super Bot Fight Mode** (paid) for advanced protection

## Step 7: Configure Origin Server

### 1. Update Signaling Server Config

Edit `.env`:

```env
# Enable Cloudflare mode
CLOUDFLARE_ENABLED=true

# Update allowed origins
ALLOWED_ORIGINS=https://gaming.yourdomain.com,https://www.yourdomain.com

# Trust proxy headers
TRUST_PROXY=true
```

### 2. Enable Cloudflare Headers

Update signaling server code:

```typescript
// Trust Cloudflare proxy
if (process.env.CLOUDFLARE_ENABLED === 'true') {
  app.set('trust proxy', true);
  
  // Get real IP from Cloudflare
  app.use((req, res, next) => {
    req.ip = req.headers['cf-connecting-ip'] as string || req.ip;
    next();
  });
}
```

### 3. Authenticate Cloudflare Requests

For added security, verify requests come from Cloudflare:

```typescript
const cloudflareIPs = [
  // IPv4 ranges - https://www.cloudflare.com/ips-v4
  '173.245.48.0/20',
  '103.21.244.0/22',
  // ... add all ranges
];

app.use((req, res, next) => {
  const ip = req.ip;
  if (!isCloudflareIP(ip)) {
    return res.status(403).send('Forbidden');
  }
  next();
});
```

## Step 8: Configure Page Rules

### Rule 1: Cache Web Client

```
URL: gaming.yourdomain.com/*
Settings:
  - Cache Level: Standard
  - Browser Cache TTL: 4 hours
  - Rocket Loader: Off (important for WebRTC)
```

### Rule 2: Signaling Server (No Cache)

```
URL: signaling.yourdomain.com/*
Settings:
  - Cache Level: Bypass
  - WebSockets: On
```

## Step 9: Analytics and Monitoring

### 1. Enable Analytics

Go to **Analytics** > **Traffic**:

- Monitor requests, bandwidth, threats
- Useful for capacity planning

### 2. Enable Web Analytics (Paid)

Go to **Analytics** > **Web Analytics**:

- Privacy-friendly analytics
- No impact on performance

### 3. Set Up Notifications

Go to **Notifications**:

**Create alerts for**:
- DDoS attacks detected
- SSL certificate expiration
- Origin server down

## Step 10: Advanced Configuration (Optional)

### Load Balancing (Paid)

For multiple signaling servers:

1. Go to **Traffic** > **Load Balancing**
2. Create a load balancer:
   ```
   Hostname: signaling.yourdomain.com
   Pools:
     - us-east (10.0.1.1:3000)
     - us-west (10.0.2.1:3000)
     - eu-west (10.0.3.1:3000)
   Steering Policy: Geo
   ```

### Cloudflare Workers (Paid)

For custom routing logic:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Route to nearest signaling server based on location
  const country = request.headers.get('CF-IPCountry');
  
  const servers = {
    US: 'https://us-signaling.yourdomain.com',
    EU: 'https://eu-signaling.yourdomain.com',
    AS: 'https://asia-signaling.yourdomain.com',
  };
  
  const region = country in servers ? country : 'US';
  const targetServer = servers[region];
  
  return fetch(targetServer + request.url.pathname, request);
}
```

## Testing Cloudflare Setup

### 1. Verify DNS Propagation

```bash
dig signaling.yourdomain.com
nslookup signaling.yourdomain.com
```

### 2. Test SSL Certificate

```bash
curl -I https://signaling.yourdomain.com
openssl s_client -connect signaling.yourdomain.com:443
```

### 3. Test WebSocket Connection

```javascript
const socket = io('https://signaling.yourdomain.com');
socket.on('connect', () => {
  console.log('Connected through Cloudflare!');
});
```

### 4. Check Cloudflare Headers

```bash
curl -I https://signaling.yourdomain.com | grep -i cf-
```

Expected headers:
```
cf-ray: 123456789abcdef0-LAX
cf-cache-status: DYNAMIC
server: cloudflare
```

## Performance Benchmarking

### Test Latency

```bash
# Without Cloudflare
ping your-server-ip

# With Cloudflare
ping signaling.yourdomain.com
```

### Test WebSocket Latency

Use the web client's stats overlay to monitor:
- RTT (Round Trip Time)
- Connection quality
- Packet loss

## Troubleshooting

### WebSocket Connection Failed

**Problem**: "WebSocket connection failed"

**Solutions**:
1. Ensure WebSockets are enabled in Cloudflare
2. Check origin server is responding
3. Verify SSL/TLS mode is correct
4. Check firewall rules aren't blocking

### High Latency

**Problem**: Increased latency through Cloudflare

**Solutions**:
1. Enable Argo Smart Routing
2. Check if routing through optimal PoP
3. Consider disabling proxy for WebRTC data (not signaling)

### SSL/TLS Errors

**Problem**: "SSL handshake failed"

**Solutions**:
1. Set SSL/TLS mode to "Full (strict)"
2. Install valid certificate on origin
3. Check certificate validity dates

### Cache Issues

**Problem**: Serving stale content

**Solutions**:
1. Purge cache: **Caching** > **Purge Everything**
2. Set proper cache rules
3. Use cache-busting query params

## Cost Optimization

### Free Plan Limits

- Unlimited requests
- Unlimited bandwidth
- Basic DDoS protection
- Shared SSL certificate
- WebSocket support
- 3 Page Rules

### When to Upgrade

**Pro ($20/month)**:
- Argo Smart Routing
- Image Optimization
- Mobile Optimization
- 20 Page Rules

**Business ($200/month)**:
- Custom SSL certificates
- Advanced DDoS
- Faster support
- 50 Page Rules

**Enterprise (Custom)**:
- 100% uptime SLA
- Dedicated support
- Custom configurations
- Advanced security

## Best Practices

1. **Always use HTTPS**: Enable "Always Use HTTPS"
2. **Minimize redirects**: Configure proper DNS from start
3. **Monitor analytics**: Regular check for anomalies
4. **Test changes**: Use staging environment first
5. **Cache static assets**: Reduce origin load
6. **Keep connections alive**: Implement heartbeat
7. **Use Argo for gaming**: Reduces latency significantly

## Security Checklist

- [ ] SSL/TLS mode set to Full (strict)
- [ ] Always Use HTTPS enabled
- [ ] DDoS protection enabled
- [ ] Bot protection configured
- [ ] Firewall rules in place
- [ ] Rate limiting configured (if paid)
- [ ] Security headers enabled
- [ ] Origin IP hidden
- [ ] Notifications configured

## Next Steps

1. Monitor performance for 24-48 hours
2. Adjust settings based on traffic patterns
3. Consider Argo for production
4. Set up monitoring and alerts
5. Plan for scaling
