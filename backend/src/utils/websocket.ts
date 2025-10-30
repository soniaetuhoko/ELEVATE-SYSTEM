import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from './jwt';

export const initializeWebSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = verifyToken(token);
      if (decoded) {
        socket.data.userId = decoded.userId;
        socket.data.role = decoded.role;
      } else {
        throw new Error('Invalid token');
      }
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.data.userId} connected`);

    // Join user-specific room
    socket.join(`user:${socket.data.userId}`);

    // Join role-specific rooms
    socket.join(`role:${socket.data.role}`);

    socket.on('disconnect', () => {
      console.log(`User ${socket.data.userId} disconnected`);
    });
  });

  return io;
};

// Notification types
export const sendNotification = (io: Server, userId: string, notification: {
  type: 'mission_update' | 'project_update' | 'reflection_update' | 'deadline_reminder';
  title: string;
  message: string;
  data?: any;
}) => {
  io.to(`user:${userId}`).emit('notification', {
    ...notification,
    timestamp: new Date().toISOString()
  });
};