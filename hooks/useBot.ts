import { useEffect, useState, useCallback } from "react";

const BOT_API_BASE = process.env.NEXT_PUBLIC_BOT_API_URL || "https://api.ziji.world";

interface UseBotOptions {
  autoFetch?: boolean;
}

/**
 * Hook to make authenticated requests to bot API from client-side
 * Automatically handles token fetching and includes it in requests
 */
export function useBot(options: UseBotOptions = {}) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch auth token from web dashboard
  const fetchToken = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/token", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to get auth token");
      }

      const data = await response.json();
      setToken(data.token);
      setError(null);

      return data.token;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("[v0] Failed to fetch bot token:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch token on mount if requested
  useEffect(() => {
    if (options.autoFetch) {
      fetchToken();
    }
  }, [fetchToken, options.autoFetch]);

  // Make authenticated request to bot API
  const request = useCallback(
    async <T = any>(
      endpoint: string,
      options?: RequestInit
    ): Promise<T> => {
      let authToken = token;

      // If no token, fetch one
      if (!authToken) {
        authToken = await fetchToken();
      }

      const url = `${BOT_API_BASE}${endpoint}`;

      console.log("[v0] Bot API Client Request:", {
        url,
        method: options?.method || "GET",
      });

      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            ...options?.headers,
          },
        });

        console.log("[v0] Bot API Client Response:", {
          status: response.status,
          ok: response.ok,
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(
            `Bot API error: ${response.status} - ${error}`
          );
        }

        const data = await response.json();
        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error("[v0] Bot API client request failed:", error);
        throw error;
      }
    },
    [token, fetchToken]
  );

  return {
    token,
    loading,
    error,
    fetchToken,
    request,
  };
}
