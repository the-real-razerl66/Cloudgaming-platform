"use strict";
/**
 * Cloud Gaming Signaling Server
 * Main entry point for the WebRTC signaling server
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionManager = exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const sessionManager_1 = require("./sessionManager");
const logger_1 = __importDefault(require("./logger"));
// Load environment variables
dotenv_1.default.config();
// Configuration
const PORT = parseInt(process.env.PORT || '3000', 10);
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT_MS || '3600000', 10);
// Initialize Express app
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
// Initialize Socket.IO with CORS
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: ALLOWED_ORIGINS,
        methods: ['GET', 'POST'],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
});
exports.io = io;
// Initialize Session Manager
const sessionManager = new sessionManager_1.SessionManager(SESSION_TIMEOUT);
exports.sessionManager = sessionManager;
// Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Disable for WebRTC
    crossOriginEmbedderPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: ALLOWED_ORIGINS,
    credentials: true,
}));
app.use(express_1.default.json());
// Trust proxy for Cloudflare
if (process.env.CLOUDFLARE_ENABLED === 'true') {
    app.set('trust proxy', true);
    logger_1.default.info('Cloudflare proxy mode enabled');
}
/**
 * REST API Endpoints
 */
// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// Get server statistics
app.get('/api/stats', (_req, res) => {
    const stats = sessionManager.getStats();
    res.json(stats);
});
// Session lookup by ID
app.get('/api/session/:sessionId', (req, res) => {
    const sessionIdParam = req.params.sessionId;
    const sessionId = Array.isArray(sessionIdParam) ? sessionIdParam[0] : sessionIdParam;
    if (!sessionId) {
        res.status(400).json({
            found: false,
            message: 'sessionId is required',
        });
        return;
    }
    const session = sessionManager.getSession(sessionId);
    const response = session
        ? {
            found: true,
            session,
        }
        : {
            found: false,
            message: 'Session not found or expired',
        };
    res.json(response);
});
// Get all active sessions
app.get('/api/sessions', (_req, res) => {
    const sessions = sessionManager.getActiveSessions();
    res.json({
        count: sessions.length,
        sessions,
    });
});
/**
 * Socket.IO Event Handlers
 */
// VM namespace for VM connections
const vmNamespace = io.of('/vm');
vmNamespace.on('connection', (socket) => {
    logger_1.default.info(`VM connected: ${socket.id}`);
    // VM registration - "phone home" system
    socket.on('register', (data, callback) => {
        try {
            const { vmId, hostname, ip, capabilities } = data;
            if (!vmId) {
                logger_1.default.error('VM registration failed: vmId is required');
                const response = {
                    success: false,
                    message: 'vmId is required',
                };
                callback(response);
                return;
            }
            // Register the VM and generate a unique session ID
            const sessionId = sessionManager.registerVM(vmId, socket.id, {
                hostname,
                ip,
                capabilities,
            });
            const response = {
                success: true,
                sessionId,
                message: 'VM registered successfully',
            };
            logger_1.default.info(`VM registered successfully: ${vmId} -> ${sessionId}`);
            callback(response);
        }
        catch (error) {
            logger_1.default.error('VM registration error:', error);
            const response = {
                success: false,
                message: 'Internal server error',
            };
            callback(response);
        }
    });
    // VM heartbeat
    socket.on('heartbeat', (data, callback) => {
        const { sessionId } = data;
        const success = sessionManager.updateHeartbeat(sessionId);
        callback({ success });
    });
    // Handle WebRTC answer from VM
    socket.on('answer', (data) => {
        const { sessionId, answer } = data;
        logger_1.default.info(`Received answer from VM for session: ${sessionId}`);
        // Forward the answer to the client
        io.of('/client').to(`session-${sessionId}`).emit('answer', { answer });
    });
    // Handle ICE candidate from VM
    socket.on('ice-candidate', (data) => {
        const { sessionId, candidate } = data;
        logger_1.default.debug(`Received ICE candidate from VM for session: ${sessionId}`);
        // Forward the ICE candidate to the client
        io.of('/client').to(`session-${sessionId}`).emit('ice-candidate', { candidate });
    });
    // VM disconnection
    socket.on('disconnect', () => {
        logger_1.default.info(`VM disconnected: ${socket.id}`);
        sessionManager.removeSessionBySocketId(socket.id);
    });
    // Error handling
    socket.on('error', (error) => {
        logger_1.default.error(`VM socket error: ${socket.id}`, error);
    });
});
// Client namespace for web client connections
const clientNamespace = io.of('/client');
clientNamespace.on('connection', (socket) => {
    logger_1.default.info(`Client connected: ${socket.id}`);
    // Client requests to join a session
    socket.on('join-session', (data, callback) => {
        const { sessionId } = data;
        const session = sessionManager.getSession(sessionId);
        if (!session) {
            logger_1.default.warn(`Client ${socket.id} tried to join non-existent session: ${sessionId}`);
            callback({
                success: false,
                message: 'Session not found or expired',
            });
            return;
        }
        if (session.status !== 'active' && session.status !== 'connected') {
            logger_1.default.warn(`Client ${socket.id} tried to join inactive session: ${sessionId}`);
            callback({
                success: false,
                message: 'Session is not active',
            });
            return;
        }
        // Join the session room
        socket.join(`session-${sessionId}`);
        sessionManager.registerClient(socket.id, sessionId);
        sessionManager.updateSessionStatus(sessionId, 'connected');
        logger_1.default.info(`Client ${socket.id} joined session: ${sessionId}`);
        callback({
            success: true,
            message: 'Joined session successfully',
            session,
        });
    });
    // Handle WebRTC offer from client
    socket.on('offer', (data) => {
        const { sessionId, offer } = data;
        const session = sessionManager.getSession(sessionId);
        if (!session) {
            logger_1.default.warn(`Received offer for non-existent session: ${sessionId}`);
            socket.emit('error', { message: 'Session not found' });
            return;
        }
        logger_1.default.info(`Received offer from client for session: ${sessionId}`);
        // Forward the offer to the VM
        vmNamespace.to(session.socketId).emit('offer', { sessionId, offer });
    });
    // Handle ICE candidate from client
    socket.on('ice-candidate', (data) => {
        const { sessionId, candidate } = data;
        const session = sessionManager.getSession(sessionId);
        if (!session) {
            logger_1.default.warn(`Received ICE candidate for non-existent session: ${sessionId}`);
            return;
        }
        logger_1.default.debug(`Received ICE candidate from client for session: ${sessionId}`);
        // Forward the ICE candidate to the VM
        vmNamespace.to(session.socketId).emit('ice-candidate', { sessionId, candidate });
    });
    // Client disconnection
    socket.on('disconnect', () => {
        logger_1.default.info(`Client disconnected: ${socket.id}`);
        sessionManager.removeClient(socket.id);
    });
    // Error handling
    socket.on('error', (error) => {
        logger_1.default.error(`Client socket error: ${socket.id}`, error);
    });
});
/**
 * Start the server
 */
httpServer.listen(PORT, () => {
    logger_1.default.info(`🚀 Signaling server started on port ${PORT}`);
    logger_1.default.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger_1.default.info(`Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
    logger_1.default.info(`Session timeout: ${SESSION_TIMEOUT}ms`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM signal received: closing HTTP server');
    httpServer.close(() => {
        logger_1.default.info('HTTP server closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger_1.default.info('SIGINT signal received: closing HTTP server');
    httpServer.close(() => {
        logger_1.default.info('HTTP server closed');
        process.exit(0);
    });
});
//# sourceMappingURL=index.js.map