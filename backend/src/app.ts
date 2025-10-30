import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import apiRouter from './routes';
import { generalLimiter, securityHeaders } from './middlewares/security';

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://elevate-system.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(securityHeaders);
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

// API routes
app.use('/api', apiRouter);

// Static (optional for uploads/public)
app.use('/public', express.static(path.join(process.cwd(), 'public')));

export default app;
