import cors, { CorsOptions } from 'cors';

export interface AppConfig {
  port: number;
  cors: CorsOptions;
}

const allowedOrigins = process.env.CORS_ORIGINS?.split(',').map(s => s.trim()).filter(Boolean);

export const config: AppConfig = {
  port: Number(process.env.PORT || 4000),
  cors: {
    origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  },
};

export const corsMiddleware = () => cors(config.cors);
