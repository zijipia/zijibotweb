'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useBotStatus } from '@/hooks/use-websocket';

interface BotStatus {
  status: 'online' | 'offline' | 'idle';
  uptime: number;
  version: string;
  lastUpdate: string;
}

interface ServerStatusProps {
  serverId: string;
}

export function ServerStatus({ serverId }: ServerStatusProps) {
  const [status, setStatus] = useState<BotStatus | null>(null);

  useBotStatus(serverId, (newStatus) => {
    setStatus(newStatus);
  });

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-400';
      case 'idle':
        return 'text-yellow-400';
      case 'offline':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  if (!status) {
    return (
      <Card className="border-slate-700 bg-slate-800 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Bot Status</h3>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-600 animate-pulse"></div>
            <span className="text-slate-400">Connecting...</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-700 bg-slate-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Bot Status</h3>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              status.status === 'online'
                ? 'bg-green-500'
                : status.status === 'idle'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
          ></div>
          <span className={`font-semibold capitalize ${getStatusColor(status.status)}`}>
            {status.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-slate-400 text-sm">Uptime</p>
          <p className="text-white font-mono text-lg">
            {formatUptime(status.uptime)}
          </p>
        </div>
        <div>
          <p className="text-slate-400 text-sm">Version</p>
          <p className="text-white font-mono text-lg">v{status.version}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-slate-400 text-xs">
          Last update: {new Date(status.lastUpdate).toLocaleString()}
        </p>
      </div>
    </Card>
  );
}
