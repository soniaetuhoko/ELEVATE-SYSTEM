import dotenv from 'dotenv';
dotenv.config();

import { validateEnv } from './config/env';
import { createServer } from 'http';
import app from './app';
import { initializeWebSocket } from './utils/websocket';

// Validate environment variables
validateEnv();

const PORT = Number(process.env.PORT || 4000);

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket
const io = initializeWebSocket(server);

// Make io available globally
app.set('io', io);

server.listen(PORT, () => {
  console.log(`🚀 ELEVATE backend listening on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
  console.log(`⚡ WebSocket server initialized`);
});
