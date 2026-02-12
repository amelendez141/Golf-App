'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { WSMessage, TeeTime } from '@/lib/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseWebSocketOptions {
  enabled?: boolean;
  onTeeTimeUpdate?: (teeTime: TeeTime) => void;
  onNewTeeTime?: (teeTime: TeeTime) => void;
  onSlotFilled?: (data: { teeTimeId: string; slotPosition: number; userId: string }) => void;
  onNotification?: (notification: unknown) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    enabled = false, // Disabled by default until auth is configured
    onTeeTimeUpdate,
    onNewTeeTime,
    onSlotFilled,
    onNotification,
  } = options;

  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  const connect = useCallback(async () => {
    if (!enabled) {
      return;
    }

    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      setStatus('connecting');

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'tee_time_update':
              onTeeTimeUpdate?.(message.payload as TeeTime);
              queryClient.invalidateQueries({ queryKey: ['teeTimeFeed'] });
              break;

            case 'new_tee_time':
              onNewTeeTime?.(message.payload as TeeTime);
              queryClient.invalidateQueries({ queryKey: ['teeTimeFeed'] });
              break;

            case 'slot_filled':
              const slotData = message.payload as {
                teeTimeId: string;
                slotPosition: number;
                userId: string;
              };
              onSlotFilled?.(slotData);
              queryClient.invalidateQueries({
                queryKey: ['teeTime', slotData.teeTimeId],
              });
              queryClient.invalidateQueries({ queryKey: ['teeTimeFeed'] });
              break;

            case 'notification':
              onNotification?.(message.payload);
              queryClient.invalidateQueries({ queryKey: ['notifications'] });
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        setStatus('disconnected');
        wsRef.current = null;

        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
          reconnectAttemptsRef.current++;

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      ws.onerror = () => {
        setStatus('error');
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setStatus('error');
    }
  }, [
    enabled,
    queryClient,
    onTeeTimeUpdate,
    onNewTeeTime,
    onSlotFilled,
    onNotification,
  ]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000);
      wsRef.current = null;
    }

    setStatus('disconnected');
    reconnectAttemptsRef.current = 0;
  }, []);

  const send = useCallback((message: WSMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    status,
    isConnected: status === 'connected',
    connect,
    disconnect,
    send,
  };
}
