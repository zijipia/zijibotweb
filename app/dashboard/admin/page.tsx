'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { ServerConfigForm } from '@/components/dashboard/config-form';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
}

interface ServerConfig {
  serverId: string;
  prefix: string;
  language: string;
  modRole: string | null;
  logChannel: string | null;
  autorole: boolean;
  autoroleIds: string[];
  customCommands: any[];
}

export default function AdminPage() {
  const router = useRouter();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [config, setConfig] = useState<ServerConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        const response = await fetch('/api/auth/guilds', {
          credentials: 'include',
        });
        if (!response.ok) {
          router.push('/');
          return;
        }
        const data = await response.json();
        const adminGuilds = data.filter((g: Guild) => g.owner);
        setGuilds(adminGuilds);
      } catch (error) {
        console.error('[v0] Fetch guilds error:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchGuilds();
  }, [router]);

  useEffect(() => {
    if (!selectedServer) return;

    const fetchConfig = async () => {
      try {
        const response = await fetch(`/api/config?serverId=${selectedServer}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        }
      } catch (error) {
        console.error('[v0] Fetch config error:', error);
      }
    };

    fetchConfig();
  }, [selectedServer]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (guilds.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>
          <Card className="border-slate-700 bg-slate-800 p-8 text-center">
            <p className="text-slate-400">
              You don't have admin access to any servers. Only server owners can access the admin panel.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>

        <div className="grid gap-8">
          {/* Server Selection */}
          <Card className="border-slate-700 bg-slate-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Select Server
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {guilds.map((guild) => (
                <button
                  key={guild.id}
                  onClick={() => setSelectedServer(guild.id)}
                  className={`p-4 rounded-lg border-2 transition text-left ${
                    selectedServer === guild.id
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
                      <p className="text-xs text-slate-400">👑 Owner</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Configuration Form */}
          {selectedServer && config && (
            <ServerConfigForm serverId={selectedServer} initialConfig={config} />
          )}
        </div>
      </div>
    </div>
  );
}
