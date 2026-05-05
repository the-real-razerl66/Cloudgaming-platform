/**
 * Cloud Gaming Signaling Server
 * Main entry point for the WebRTC signaling server
 */
import { Server } from 'socket.io';
import { SessionManager } from './sessionManager';
declare const app: import("express-serve-static-core").Express;
declare const io: Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
declare const sessionManager: SessionManager;
export { app, io, sessionManager };
//# sourceMappingURL=index.d.ts.map