import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

interface Notification {
  type: 'mission_update' | 'project_update' | 'reflection_update' | 'deadline_reminder';
  title: string;
  message: string;
  data?: any;
  timestamp: string;
}

export const useWebSocket = (token: string | null) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(import.meta.env.VITE_WS_URL || 'https://elevate-system.onrender.com', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    });

    newSocket.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
      
      // Show toast notification
      toast(notification.title, {
        description: notification.message,
        duration: 5000,
      });
    });

    newSocket.on('connect_error', (error: any) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  const sendMessage = (event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  const markNotificationAsRead = (index: number) => {
    setNotifications(prev => 
      prev.map((notif, i) => 
        i === index ? { ...notif, read: true } : notif
      )
    );
  };

  return {
    socket,
    isConnected,
    notifications,
    sendMessage,
    markNotificationAsRead
  };
};