'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { botWS, BotDashboardWS } from '@/lib/ws';

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { autoConnect = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<BotDashboardWS>(botWS);

  useEffect(() => {
    if (!autoConnect) return;

    const connect = async () => {
      try {
        await wsRef.current.connect();
        setIsConnected(true);
        setError(null);
      } catch (err) {
        console.error('[v0] WebSocket connection error:', err);
        setError(err instanceof Error ? err.message : 'Connection failed');
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      // Don't close on unmount to keep connection alive
    };
  }, [autoConnect]);

  const send = useCallback((type: string, payload: any) => {
    if (!wsRef.current.isConnected()) {
      console.warn('[v0] WebSocket not connected');
      return false;
    }
    wsRef.current.send(type, payload);
    return true;
  }, []);

  const on = useCallback(
    (type: string, callback: (data: any) => void) => {
      return wsRef.current.on(type, callback);
    },
    []
  );

  const disconnect = useCallback(() => {
    wsRef.current.close();
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    error,
    send,
    on,
    disconnect,
    ws: wsRef.current,
  };
}

/**
 * Hook for listening to config updates
 */
export function useConfigUpdates(
  serverId: string,
  onUpdate: (config: any) => void
) {
  const { on, isConnected } = useWebSocket();

  useEffect(() => {
    if (!isConnected) return;

    // Listen for config updates
    const unsubscribe = on('config:updated', (payload) => {
      if (payload.serverId === serverId) {
        onUpdate(payload.config);
      }
    });

    return unsubscribe;
  }, [serverId, isConnected, on, onUpdate]);
}

/**
 * Hook for monitoring bot status
 */
export function useBotStatus(serverId: string, onStatusChange: (status: any) => void) {
  const { on, isConnected } = useWebSocket();

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = on('bot:status', (payload) => {
      if (payload.serverId === serverId) {
        onStatusChange(payload);
      }
    });

    return unsubscribe;
  }, [serverId, isConnected, on, onStatusChange]);
}
