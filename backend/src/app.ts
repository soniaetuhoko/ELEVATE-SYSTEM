import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import apiRouter from './routes';
import { generalLimiter, securityHeaders } from './middlewares/security';
import { performanceMonitor } from './middlewares/monitoring';

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'https://elevate-system.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(securityHeaders);
app.use(performanceMonitor);
app.use(generalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check with deployment info
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    swagger: '/docs'
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'ELEVATE API Server',
    version: '1.0.0',
    documentation: '/docs',
    health: '/health',
    api: '/api'
  });
});

// Docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API root endpoint
app.get('/api', (_req, res) => {
  res.json({
    message: 'ELEVATE API Server',
    version: '1.0.0',
    documentation: '/docs',
    health: '/health',
    api: '/api',
    endpoints: {
      auth: '/api/auth',
      missions: '/api/missions',
      projects: '/api/projects',
      reflections: '/api/reflections',
      profile: '/api/profile',
      stats: '/api/stats',
      search: '/api/search',
      notifications: '/api/notifications',
      circles: '/api/circles',
      admin: '/api/admin',
      upload: '/api/upload',
      docs: '/api/docs'
    }
  });
});

// API routes
app.use('/api', apiRouter);

// Static (optional for uploads/public)
app.use('/public', express.static(path.join(process.cwd(), 'public')));

export default app;
