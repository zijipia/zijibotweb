'use client';

import { useEffect, useState } from 'react';
import { useBot } from '@/hooks/useBot';
import { Card } from '@/components/ui/card';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

interface ServerSelectorProps {
  onSelect: (serverId: string) => void;
  selectedServerId?: string;
}

export function ServerSelector({ onSelect, selectedServerId }: ServerSelectorProps) {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const { request } = useBot({ autoFetch: true });

  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        const response = await request<{ data: Guild[] }>(
          '/bot/users/me/guilds',
          { method: 'GET' }
        );
        if (response?.data) {
          setGuilds(response.data);
        }
      } catch (error) {
        console.error('[v0] Fetch guilds error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuilds();
  }, [request]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (guilds.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No servers found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {guilds.map((guild) => (
        <button
          key={guild.id}
          onClick={() => onSelect(guild.id)}
          className={`p-4 rounded-lg border-2 transition text-left ${
            selectedServerId === guild.id
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-700 bg-slate-800 hover:border-blue-400'
          }`}
        >
          <div className="flex items-center gap-3">
            {guild.icon ? (
              <img
                src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                alt={guild.name}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                <span className="text-white font-bold">
                  {guild.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-white">{guild.name}</p>
              <p className="text-xs text-slate-400">
                {guild.owner ? '👑 Owner' : 'Member'}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
