'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ServerSelector } from '@/components/dashboard/server-selector';
import { Card } from '@/components/ui/card';

export default function DashboardPage() {
  const router = useRouter();
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include',
        });
        if (!response.ok) {
          router.push('/');
        }
      } catch (error) {
        console.error('[v0] Auth check error:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

        <div className="grid gap-8">
          {!selectedServer ? (
            <Card className="border-slate-700 bg-slate-800 p-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                Select a Server
              </h2>
              <ServerSelector onSelect={setSelectedServer} />
            </Card>
          ) : (
            <div>
              <button
                onClick={() => setSelectedServer(null)}
                className="mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition"
              >
                ← Back to Servers
              </button>
              <ServerSelector
                selectedServerId={selectedServer}
                onSelect={setSelectedServer}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
