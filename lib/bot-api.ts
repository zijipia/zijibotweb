/**
 * Bot Server API Client
 * Communicates with the Discord bot server at https://api.ziji.world/
 */

const BOT_API_BASE = process.env.BOT_API_URL || "https://api.ziji.world";

interface BotApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Make request to bot API
 */
async function botApiRequest<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BOT_API_BASE}${endpoint}`;
  console.log("[v0] Bot API Request:", {
    url,
    method: options?.method || "GET",
    timestamp: new Date().toISOString(),
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    console.log("[v0] Bot API Response:", {
      url,
      status: response.status,
      ok: response.ok,
      timestamp: new Date().toISOString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[v0] Bot API error at ${endpoint}:`, {
        status: response.status,
        error,
      });
      throw new Error(`Bot API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log("[v0] Bot API parsed response:", { endpoint, dataType: typeof data, hasData: !!data });
    return data as T;
  } catch (error) {
    console.error(`[v0] Bot API request failed for ${endpoint}:`, {
      url,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

/**
 * Get user's Discord guilds/servers from bot
 */
export async function getBotUserGuilds(userId: string): Promise<any[]> {
  try {
    console.log("[v0] getBotUserGuilds called for userId:", userId);
    const response = await botApiRequest<BotApiResponse>(
      `/bot/users/${userId}/guilds`,
      {
        method: "GET",
      }
    );

    console.log("[v0] getBotUserGuilds response:", response);
    return response.data || [];
  } catch (error) {
    console.error("[v0] Failed to get user guilds from bot:", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

/**
 * Save user session to bot (store access token, user info)
 */
export async function saveBotUserSession(
  userId: string,
  discordAccessToken: string,
  userInfo: {
    username: string;
    avatar: string;
    email: string;
  }
): Promise<boolean> {
  try {
    const response = await botApiRequest<BotApiResponse>(
      `/bot/users/${userId}/session`,
      {
        method: "POST",
        body: JSON.stringify({
          discordAccessToken,
          userInfo,
        }),
      }
    );

    return response.success || false;
  } catch (error) {
    console.error("[v0] Failed to save user session to bot:", error);
    return false;
  }
}

/**
 * Save user guilds list to bot
 */
export async function saveBotUserGuilds(
  userId: string,
  guilds: any[]
): Promise<boolean> {
  try {
    const response = await botApiRequest<BotApiResponse>(
      `/bot/users/${userId}/guilds`,
      {
        method: "POST",
        body: JSON.stringify({ guilds }),
      }
    );

    return response.success || false;
  } catch (error) {
    console.error("[v0] Failed to save user guilds to bot:", error);
    return false;
  }
}

/**
 * Get server config from bot
 */
export async function getBotServerConfig(serverId: string): Promise<any> {
  try {
    const response = await botApiRequest<BotApiResponse>(
      `/bot/servers/${serverId}/config`,
      {
        method: "GET",
      }
    );

    return response.data || null;
  } catch (error) {
    console.error(`[v0] Failed to get config for server ${serverId}:`, error);
    return null;
  }
}

/**
 * Update server config on bot
 */
export async function updateBotServerConfig(
  serverId: string,
  config: any
): Promise<boolean> {
  try {
    const response = await botApiRequest<BotApiResponse>(
      `/bot/servers/${serverId}/config`,
      {
        method: "POST",
        body: JSON.stringify(config),
      }
    );

    return response.success || false;
  } catch (error) {
    console.error(`[v0] Failed to update config for server ${serverId}:`, error);
    return false;
  }
}

/**
 * Get server info from bot
 */
export async function getBotServerInfo(serverId: string): Promise<any> {
  try {
    const response = await botApiRequest<BotApiResponse>(
      `/bot/servers/${serverId}/info`,
      {
        method: "GET",
      }
    );

    return response.data || null;
  } catch (error) {
    console.error(`[v0] Failed to get server info for ${serverId}:`, error);
    return null;
  }
}

/**
 * Check if user has admin access to server
 */
export async function checkBotServerAdmin(
  userId: string,
  serverId: string
): Promise<boolean> {
  try {
    const response = await botApiRequest<BotApiResponse>(
      `/bot/users/${userId}/servers/${serverId}/admin`,
      {
        method: "GET",
      }
    );

    return response.data?.isAdmin || false;
  } catch (error) {
    console.error("[v0] Failed to check admin status:", error);
    return false;
  }
}
