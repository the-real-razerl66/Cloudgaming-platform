/**
 * Session Manager - Handles VM sessions and client connections
 */
import { VMSession, ClientConnection, ServerStats } from './types';
export declare class SessionManager {
    private sessions;
    private clients;
    private vmSocketMap;
    private sessionTimeout;
    constructor(sessionTimeout?: number);
    /**
     * Register a new VM and generate a unique session ID
     */
    registerVM(vmId: string, socketId: string, metadata?: any): string;
    /**
     * Update VM heartbeat
     */
    updateHeartbeat(sessionId: string): boolean;
    /**
     * Get session by ID
     */
    getSession(sessionId: string): VMSession | undefined;
    /**
     * Get session by VM socket ID
     */
    getSessionBySocketId(socketId: string): VMSession | undefined;
    /**
     * Update session status
     */
    updateSessionStatus(sessionId: string, status: VMSession['status']): boolean;
    /**
     * Remove a VM session
     */
    removeSession(sessionId: string): boolean;
    /**
     * Remove session by socket ID
     */
    removeSessionBySocketId(socketId: string): boolean;
    /**
     * Register a client connection
     */
    registerClient(socketId: string, sessionId: string): void;
    /**
     * Update client status
     */
    updateClientStatus(socketId: string, status: ClientConnection['status']): void;
    /**
     * Remove a client connection
     */
    removeClient(socketId: string): void;
    /**
     * Get all active sessions
     */
    getActiveSessions(): VMSession[];
    /**
     * Get server statistics
     */
    getStats(): ServerStats;
    /**
     * Clean up expired sessions
     */
    private cleanupExpiredSessions;
    /**
     * Start periodic cleanup interval
     */
    private startCleanupInterval;
}
//# sourceMappingURL=sessionManager.d.ts.map