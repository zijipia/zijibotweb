'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DiscordCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const handleCallback = useCallback(async () => {
    if (!code) {
      router.push('/');
      return;
    }

    try {
      // Call the API route that will set the cookie
      const response = await fetch('/api/auth/callback/discord/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        // Redirect to dashboard after successful auth
        router.push('/dashboard');
      } else {
        router.push('/?error=auth_failed');
      }
    } catch (error) {
      console.error('[v0] Callback error:', error);
      router.push('/?error=auth_failed');
    }
  }, [code, router]);

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-6 text-slate-400 text-lg">Authenticating with Discord...</p>
      </div>
    </div>
  );
}
