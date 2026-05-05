/**
 * Session Manager - Handles VM sessions and client connections
 */

import { v4 as uuidv4 } from 'uuid';
import { VMSession, ClientConnection, ServerStats } from './types';
import logger from './logger';

export class SessionManager {
  private sessions: Map<string, VMSession> = new Map();
  private clients: Map<string, ClientConnection> = new Map();
  private vmSocketMap: Map<string, string> = new Map(); // socketId -> sessionId
  private sessionTimeout: number;

  constructor(sessionTimeout: number = 3600000) {
    this.sessionTimeout = sessionTimeout;
    this.startCleanupInterval();
  }

  /**
   * Register a new VM and generate a unique session ID
   */
  registerVM(vmId: string, socketId: string, metadata?: any): string {
    const sessionId = uuidv4();
    const session: VMSession = {
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

    logger.info(`VM registered: ${vmId} with session ID: ${sessionId}`);
    return sessionId;
  }

  /**
   * Update VM heartbeat
   */
  updateHeartbeat(sessionId: string): boolean {
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
  getSession(sessionId: string): VMSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get session by VM socket ID
   */
  getSessionBySocketId(socketId: string): VMSession | undefined {
    const sessionId = this.vmSocketMap.get(socketId);
    if (sessionId) {
      return this.sessions.get(sessionId);
    }
    return undefined;
  }

  /**
   * Update session status
   */
  updateSessionStatus(sessionId: string, status: VMSession['status']): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = status;
      logger.info(`Session ${sessionId} status updated to: ${status}`);
      return true;
    }
    return false;
  }

  /**
   * Remove a VM session
   */
  removeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.vmSocketMap.delete(session.socketId);
      this.sessions.delete(sessionId);
      logger.info(`Session removed: ${sessionId}`);
      return true;
    }
    return false;
  }

  /**
   * Remove session by socket ID
   */
  removeSessionBySocketId(socketId: string): boolean {
    const sessionId = this.vmSocketMap.get(socketId);
    if (sessionId) {
      return this.removeSession(sessionId);
    }
    return false;
  }

  /**
   * Register a client connection
   */
  registerClient(socketId: string, sessionId: string): void {
    const client: ClientConnection = {
      socketId,
      sessionId,
      connectedAt: new Date(),
      status: 'connecting',
    };
    this.clients.set(socketId, client);
    logger.info(`Client registered: ${socketId} for session: ${sessionId}`);
  }

  /**
   * Update client status
   */
  updateClientStatus(socketId: string, status: ClientConnection['status']): void {
    const client = this.clients.get(socketId);
    if (client) {
      client.status = status;
    }
  }

  /**
   * Remove a client connection
   */
  removeClient(socketId: string): void {
    this.clients.delete(socketId);
    logger.info(`Client removed: ${socketId}`);
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): VMSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.status === 'active' || session.status === 'connected'
    );
  }

  /**
   * Get server statistics
   */
  getStats(): ServerStats {
    const activeSessions = this.getActiveSessions().length;
    const connectedClients = Array.from(this.clients.values()).filter(
      (client) => client.status === 'connected'
    ).length;

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
  private cleanupExpiredSessions(): void {
    const now = new Date();
    const expiredSessions: string[] = [];

    this.sessions.forEach((session, sessionId) => {
      const timeSinceHeartbeat = now.getTime() - session.lastHeartbeat.getTime();
      if (timeSinceHeartbeat > this.sessionTimeout) {
        expiredSessions.push(sessionId);
      }
    });

    expiredSessions.forEach((sessionId) => {
      logger.warn(`Session expired: ${sessionId}`);
      this.removeSession(sessionId);
    });

    if (expiredSessions.length > 0) {
      logger.info(`Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  /**
   * Start periodic cleanup interval
   */
  private startCleanupInterval(): void {
    const cleanupInterval = parseInt(process.env.CLEANUP_INTERVAL_MS || '60000', 10);
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, cleanupInterval);
    logger.info(`Cleanup interval started: ${cleanupInterval}ms`);
  }
}
