/**
 * Cloud Gaming Signaling Server
 * Main entry point for the WebRTC signaling server
 */

import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { SessionManager } from './sessionManager';
import {
  VMRegistrationRequest,
  VMRegistrationResponse,
  SessionLookupResponse,
} from './types';
import logger from './logger';

// Load environment variables
dotenv.config();

// Configuration
const PORT = parseInt(process.env.PORT || '3000', 10);
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT_MS || '3600000', 10);

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Initialize Session Manager
const sessionManager = new SessionManager(SESSION_TIMEOUT);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for WebRTC
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
}));

app.use(express.json());

// Trust proxy for Cloudflare
if (process.env.CLOUDFLARE_ENABLED === 'true') {
  app.set('trust proxy', true);
  logger.info('Cloudflare proxy mode enabled');
}

/**
 * REST API Endpoints
 */

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Get server statistics
app.get('/api/stats', (_req: Request, res: Response) => {
  const stats = sessionManager.getStats();
  res.json(stats);
});

// Session lookup by ID
app.get('/api/session/:sessionId', (req: Request, res: Response) => {
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

  const response: SessionLookupResponse = session
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
app.get('/api/sessions', (_req: Request, res: Response) => {
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

vmNamespace.on('connection', (socket: Socket) => {
  logger.info(`VM connected: ${socket.id}`);

  // VM registration - "phone home" system
  socket.on('register', (data: VMRegistrationRequest, callback) => {
    try {
      const { vmId, hostname, ip, capabilities } = data;

      if (!vmId) {
        logger.error('VM registration failed: vmId is required');
        const response: VMRegistrationResponse = {
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

      const response: VMRegistrationResponse = {
        success: true,
        sessionId,
        message: 'VM registered successfully',
      };

      logger.info(`VM registered successfully: ${vmId} -> ${sessionId}`);
      callback(response);
    } catch (error) {
      logger.error('VM registration error:', error);
      const response: VMRegistrationResponse = {
        success: false,
        message: 'Internal server error',
      };
      callback(response);
    }
  });

  // VM heartbeat
  socket.on('heartbeat', (data: { sessionId: string }, callback) => {
    const { sessionId } = data;
    const success = sessionManager.updateHeartbeat(sessionId);
    callback({ success });
  });

  // Handle WebRTC answer from VM
  socket.on('answer', (data: { sessionId: string; answer: any }) => {
    const { sessionId, answer } = data;
    logger.info(`Received answer from VM for session: ${sessionId}`);
    
    // Forward the answer to the client
    io.of('/client').to(`session-${sessionId}`).emit('answer', { answer });
  });

  // Handle ICE candidate from VM
  socket.on('ice-candidate', (data: { sessionId: string; candidate: any }) => {
    const { sessionId, candidate } = data;
    logger.debug(`Received ICE candidate from VM for session: ${sessionId}`);
    
    // Forward the ICE candidate to the client
    io.of('/client').to(`session-${sessionId}`).emit('ice-candidate', { candidate });
  });

  // VM disconnection
  socket.on('disconnect', () => {
    logger.info(`VM disconnected: ${socket.id}`);
    sessionManager.removeSessionBySocketId(socket.id);
  });

  // Error handling
  socket.on('error', (error) => {
    logger.error(`VM socket error: ${socket.id}`, error);
  });
});

// Client namespace for web client connections
const clientNamespace = io.of('/client');

clientNamespace.on('connection', (socket: Socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Client requests to join a session
  socket.on('join-session', (data: { sessionId: string }, callback) => {
    const { sessionId } = data;
    const session = sessionManager.getSession(sessionId);

    if (!session) {
      logger.warn(`Client ${socket.id} tried to join non-existent session: ${sessionId}`);
      callback({
        success: false,
        message: 'Session not found or expired',
      });
      return;
    }

    if (session.status !== 'active' && session.status !== 'connected') {
      logger.warn(`Client ${socket.id} tried to join inactive session: ${sessionId}`);
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

    logger.info(`Client ${socket.id} joined session: ${sessionId}`);
    callback({
      success: true,
      message: 'Joined session successfully',
      session,
    });
  });

  // Handle WebRTC offer from client
  socket.on('offer', (data: { sessionId: string; offer: any }) => {
    const { sessionId, offer } = data;
    const session = sessionManager.getSession(sessionId);

    if (!session) {
      logger.warn(`Received offer for non-existent session: ${sessionId}`);
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    logger.info(`Received offer from client for session: ${sessionId}`);
    
    // Forward the offer to the VM
    vmNamespace.to(session.socketId).emit('offer', { sessionId, offer });
  });

  // Handle ICE candidate from client
  socket.on('ice-candidate', (data: { sessionId: string; candidate: any }) => {
    const { sessionId, candidate } = data;
    const session = sessionManager.getSession(sessionId);

    if (!session) {
      logger.warn(`Received ICE candidate for non-existent session: ${sessionId}`);
      return;
    }

    logger.debug(`Received ICE candidate from client for session: ${sessionId}`);
    
    // Forward the ICE candidate to the VM
    vmNamespace.to(session.socketId).emit('ice-candidate', { sessionId, candidate });
  });

  // Client disconnection
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
    sessionManager.removeClient(socket.id);
  });

  // Error handling
  socket.on('error', (error) => {
    logger.error(`Client socket error: ${socket.id}`, error);
  });
});

/**
 * Start the server
 */
httpServer.listen(PORT, () => {
  logger.info(`🚀 Signaling server started on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
  logger.info(`Session timeout: ${SESSION_TIMEOUT}ms`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export { app, io, sessionManager };
