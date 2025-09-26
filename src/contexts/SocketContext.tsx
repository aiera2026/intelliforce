import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
  sendAgentAction: (action: any) => void;
  sendWorkflowAction: (action: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

  useEffect(() => {
    if (user) {
      initializeSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [user]);

  const initializeSocket = () => {
    const token = localStorage.getItem('token');
    
    const newSocket = io(WS_URL, {
      transports: ['websocket'],
      auth: {
        token,
      },
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
    }
  };

  const joinProject = (projectId: string) => {
    if (socket) {
      socket.emit('join-project', projectId);
    }
  };

  const leaveProject = (projectId: string) => {
    if (socket) {
      socket.emit('leave-project', projectId);
    }
  };

  const sendAgentAction = (action: any) => {
    if (socket) {
      socket.emit('agent-action', action);
    }
  };

  const sendWorkflowAction = (action: any) => {
    if (socket) {
      socket.emit('workflow-action', action);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        joinProject,
        leaveProject,
        sendAgentAction,
        sendWorkflowAction,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
