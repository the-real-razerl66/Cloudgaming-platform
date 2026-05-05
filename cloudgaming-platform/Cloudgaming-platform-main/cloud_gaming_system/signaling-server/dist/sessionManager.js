"use strict";
/**
 * Session Manager - Handles VM sessions and client connections
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = void 0;
const uuid_1 = require("uuid");
const logger_1 = __importDefault(require("./logger"));
class SessionManager {
    constructor(sessionTimeout = 3600000) {
        this.sessions = new Map();
        this.clients = new Map();
        this.vmSocketMap = new Map(); // socketId -> sessionId
        this.sessionTimeout = sessionTimeout;
        this.startCleanupInterval();
    }
    /**
     * Register a new VM and generate a unique session ID
     */
    registerVM(vmId, socketId, metadata) {
        const sessionId = (0, uuid_1.v4)();
        const session = {
            sessionId,
            vmId,
            socketId,
            registeredAt: new Date(),
            lastHeartbeat: new Date(),
            status: 'active',
            metadata,
        };
        this.sessions.set(sessionId, session);
        this.vmSocketMap.set(socketId, sessionId);
        logger_1.default.info(`VM registered: ${vmId} with session ID: ${sessionId}`);
        return sessionId;
    }
    /**
     * Update VM heartbeat
     */
    updateHeartbeat(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.lastHeartbeat = new Date();
            return true;
        }
        return false;
    }
    /**
     * Get session by ID
     */
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    /**
     * Get session by VM socket ID
     */
    getSessionBySocketId(socketId) {
        const sessionId = this.vmSocketMap.get(socketId);
        if (sessionId) {
            return this.sessions.get(sessionId);
        }
        return undefined;
    }
    /**
     * Update session status
     */
    updateSessionStatus(sessionId, status) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.status = status;
            logger_1.default.info(`Session ${sessionId} status updated to: ${status}`);
            return true;
        }
        return false;
    }
    /**
     * Remove a VM session
     */
    removeSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            this.vmSocketMap.delete(session.socketId);
            this.sessions.delete(sessionId);
            logger_1.default.info(`Session removed: ${sessionId}`);
            return true;
        }
        return false;
    }
    /**
     * Remove session by socket ID
     */
    removeSessionBySocketId(socketId) {
        const sessionId = this.vmSocketMap.get(socketId);
        if (sessionId) {
            return this.removeSession(sessionId);
        }
        return false;
    }
    /**
     * Register a client connection
     */
    registerClient(socketId, sessionId) {
        const client = {
            socketId,
            sessionId,
            connectedAt: new Date(),
            status: 'connecting',
        };
        this.clients.set(socketId, client);
        logger_1.default.info(`Client registered: ${socketId} for session: ${sessionId}`);
    }
    /**
     * Update client status
     */
    updateClientStatus(socketId, status) {
        const client = this.clients.get(socketId);
        if (client) {
            client.status = status;
        }
    }
    /**
     * Remove a client connection
     */
    removeClient(socketId) {
        this.clients.delete(socketId);
        logger_1.default.info(`Client removed: ${socketId}`);
    }
    /**
     * Get all active sessions
     */
    getActiveSessions() {
        return Array.from(this.sessions.values()).filter((session) => session.status === 'active' || session.status === 'connected');
    }
    /**
     * Get server statistics
     */
    getStats() {
        const activeSessions = this.getActiveSessions().length;
        const connectedClients = Array.from(this.clients.values()).filter((client) => client.status === 'connected').length;
        return {
            activeSessions,
            connectedClients,
            totalVMs: this.sessions.size,
            uptime: process.uptime(),
        };
    }
    /**
     * Clean up expired sessions
     */
    cleanupExpiredSessions() {
        const now = new Date();
        const expiredSessions = [];
        this.sessions.forEach((session, sessionId) => {
            const timeSinceHeartbeat = now.getTime() - session.lastHeartbeat.getTime();
            if (timeSinceHeartbeat > this.sessionTimeout) {
                expiredSessions.push(sessionId);
            }
        });
        expiredSessions.forEach((sessionId) => {
            logger_1.default.warn(`Session expired: ${sessionId}`);
            this.removeSession(sessionId);
        });
        if (expiredSessions.length > 0) {
            logger_1.default.info(`Cleaned up ${expiredSessions.length} expired sessions`);
        }
    }
    /**
     * Start periodic cleanup interval
     */
    startCleanupInterval() {
        const cleanupInterval = parseInt(process.env.CLEANUP_INTERVAL_MS || '60000', 10);
        setInterval(() => {
            this.cleanupExpiredSessions();
        }, cleanupInterval);
        logger_1.default.info(`Cleanup interval started: ${cleanupInterval}ms`);
    }
}
exports.SessionManager = SessionManager;
//# sourceMappingURL=sessionManager.js.map