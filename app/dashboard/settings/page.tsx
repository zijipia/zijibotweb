'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/');
    } catch (error) {
      console.error('[v0] Logout error:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Account Settings */}
          <Card className="border-slate-700 bg-slate-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Account
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm mb-2">
                  You are logged in with your Discord account.
                </p>
              </div>
              <Button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Logout
              </Button>
            </div>
          </Card>

          {/* API Documentation */}
          <Card className="border-slate-700 bg-slate-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              API Documentation
            </h2>
            <div className="space-y-4 text-slate-300">
              <div>
                <h3 className="font-semibold text-white mb-2">
                  Get Server Config
                </h3>
                <code className="block bg-slate-900 p-3 rounded text-sm overflow-x-auto">
                  GET /api/config?serverId=SERVER_ID
                </code>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">
                  Update Server Config
                </h3>
                <code className="block bg-slate-900 p-3 rounded text-sm overflow-x-auto">
                  PUT /api/config
                </code>
                <p className="text-sm mt-2">
                  Body: {'{'}serverId, config{'}'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">
                  WebSocket Connection
                </h3>
                <code className="block bg-slate-900 p-3 rounded text-sm overflow-x-auto">
                  ws://api.ziji.world
                </code>
                <p className="text-sm mt-2">
                  Connect for real-time config updates
                </p>
              </div>
            </div>
          </Card>

          {/* Environment Setup */}
          <Card className="border-slate-700 bg-slate-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Environment Variables
            </h2>
            <div className="space-y-2 text-sm text-slate-300">
              <p>
                <code className="bg-slate-900 px-2 py-1 rounded">
                  DISCORD_CLIENT_ID
                </code>
                - Your Discord application ID
              </p>
              <p>
                <code className="bg-slate-900 px-2 py-1 rounded">
                  DISCORD_CLIENT_SECRET
                </code>
                - Your Discord application secret
              </p>
              <p>
                <code className="bg-slate-900 px-2 py-1 rounded">
                  DISCORD_REDIRECT_URI
                </code>
                - OAuth callback URL
              </p>
              <p>
                <code className="bg-slate-900 px-2 py-1 rounded">
                  NEXTAUTH_SECRET
                </code>
                - Session encryption key
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
