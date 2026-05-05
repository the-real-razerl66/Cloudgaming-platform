/**
 * Type definitions for the cloud gaming signaling server
 */
/**
 * VM Session data structure
 */
export interface VMSession {
    sessionId: string;
    vmId: string;
    socketId: string;
    registeredAt: Date;
    lastHeartbeat: Date;
    status: 'active' | 'connected' | 'disconnected';
    metadata?: {
        hostname?: string;
        ip?: string;
        capabilities?: {
            maxResolution: string;
            maxBitrate: number;
            codecs: string[];
        };
    };
}
/**
 * Client connection data
 */
export interface ClientConnection {
    socketId: string;
    sessionId: string;
    connectedAt: Date;
    status: 'connecting' | 'connected' | 'disconnected';
}
/**
 * WebRTC signaling messages
 */
export interface SignalingMessage {
    type: 'offer' | 'answer' | 'ice-candidate';
    sessionId: string;
    data: any;
}
/**
 * VM registration request
 */
export interface VMRegistrationRequest {
    vmId: string;
    hostname?: string;
    ip?: string;
    capabilities?: {
        maxResolution: string;
        maxBitrate: number;
        codecs: string[];
    };
}
/**
 * VM registration response
 */
export interface VMRegistrationResponse {
    success: boolean;
    sessionId?: string;
    message: string;
}
/**
 * Session lookup response
 */
export interface SessionLookupResponse {
    found: boolean;
    session?: VMSession;
    message?: string;
}
/**
 * Server statistics
 */
export interface ServerStats {
    activeSessions: number;
    connectedClients: number;
    totalVMs: number;
    uptime: number;
}
//# sourceMappingURL=types.d.ts.map