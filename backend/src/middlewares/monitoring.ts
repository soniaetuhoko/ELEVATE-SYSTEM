import { Request, Response, NextFunction } from 'express';

interface PerformanceMetrics {
  requestCount: number;
  activeConnections: number;
  averageResponseTime: number;
  uptime: number;
  lastUpdated: Date;
}

let metrics: PerformanceMetrics = {
  requestCount: 0,
  activeConnections: 0,
  averageResponseTime: 0,
  uptime: Date.now(),
  lastUpdated: new Date()
};

const responseTimes: number[] = [];

export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  metrics.requestCount++;
  metrics.activeConnections++;
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    responseTimes.push(responseTime);
    
    // Keep only last 100 response times for average calculation
    if (responseTimes.length > 100) {
      responseTimes.shift();
    }
    
    metrics.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    metrics.activeConnections--;
    metrics.lastUpdated = new Date();
  });
  
  next();
};

export const getPerformanceMetrics = (): PerformanceMetrics & { 
  uptimeHours: number;
  memoryUsage: NodeJS.MemoryUsage;
} => {
  const uptimeMs = Date.now() - metrics.uptime;
  const uptimeHours = uptimeMs / (1000 * 60 * 60);
  
  return {
    ...metrics,
    uptimeHours: Math.round(uptimeHours * 100) / 100,
    memoryUsage: process.memoryUsage()
  };
};