/**
 * Guild Configuration API Client
 * Communicates with the Discord bot server for ZiGuild configuration
 */

import { ZiGuildConfig, ZiGuildConfigDB } from './types';

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

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[v0] Guild API error at ${endpoint}:`, error);
      throw new Error(`Guild API error: ${response.status}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`[v0] Guild API request failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Get ZiGuild configuration for a guild
 */
export async function getGuildConfig(guildId: string): Promise<ZiGuildConfig | null> {
  try {
    const response = await botApiRequest<BotApiResponse>(
      `/bot/guilds/${guildId}/config`,
      {
        method: "GET",
      }
    );

    if (!response.success) {
      console.warn(`[v0] Guild config not found for ${guildId}`);
      return null;
    }

    return response.data as ZiGuildConfig || null;
  } catch (error) {
    console.error(`[v0] Failed to get guild config for ${guildId}:`, error);
    return null;
  }
}

/**
 * Create a new ZiGuild configuration
 */
export async function createGuildConfig(
  guildId: string,
  config?: Partial<ZiGuildConfig>
): Promise<ZiGuildConfig | null> {
  try {
    const defaultConfig: ZiGuildConfig = {
      guildId,
      voice: {
        logMode: config?.voice?.logMode || false,
      },
      joinToCreate: {
        enabled: config?.joinToCreate?.enabled || false,
        voiceChannelId: config?.joinToCreate?.voiceChannelId || null,
        categoryId: config?.joinToCreate?.categoryId || null,
        defaultUserLimit: config?.joinToCreate?.defaultUserLimit || 0,
        tempChannels: config?.joinToCreate?.tempChannels || [],
        blockedUser: config?.joinToCreate?.blockedUser || [],
      },
      autoRole: {
        enabled: config?.autoRole?.enabled || false,
        roleIds: config?.autoRole?.roleIds || [],
      },
      updatedAt: new Date(),
    };

    const response = await botApiRequest<BotApiResponse>(
      `/bot/guilds/${guildId}/config`,
      {
        method: "POST",
        body: JSON.stringify(defaultConfig),
      }
    );

    if (!response.success) {
      console.error(`[v0] Failed to create guild config for ${guildId}`);
      return null;
    }

    return response.data as ZiGuildConfig;
  } catch (error) {
    console.error(`[v0] Failed to create guild config for ${guildId}:`, error);
    return null;
  }
}

/**
 * Update ZiGuild configuration
 */
export async function updateGuildConfig(
  guildId: string,
  config: Partial<ZiGuildConfig>
): Promise<ZiGuildConfig | null> {
  try {
    const updateData = {
      ...config,
      guildId,
      updatedAt: new Date(),
    };

    const response = await botApiRequest<BotApiResponse>(
      `/bot/guilds/${guildId}/config`,
      {
        method: "PUT",
        body: JSON.stringify(updateData),
      }
    );

    if (!response.success) {
      console.error(`[v0] Failed to update guild config for ${guildId}`);
      return null;
    }

    return response.data as ZiGuildConfig;
  } catch (error) {
    console.error(`[v0] Failed to update guild config for ${guildId}:`, error);
    return null;
  }
}

/**
 * Update voice configuration for a guild
 */
export async function updateVoiceConfig(
  guildId: string,
  voiceConfig: { logMode: boolean }
): Promise<ZiGuildConfig | null> {
  try {
    const response = await botApiRequest<BotApiResponse>(
      `/bot/guilds/${guildId}/config/voice`,
      {
        method: "PUT",
        body: JSON.stringify(voiceConfig),
      }
    );

    if (!response.success) {
      console.error(`[v0] Failed to update voice config for ${guildId}`);
      return null;
    }

    return response.data as ZiGuildConfig;
  } catch (error) {
    console.error(`[v0] Failed to update voice config for ${guildId}:`, error);
    return null;
  }
}

/**
 * Update join-to-create configuration
 */
export async function updateJoinToCreateConfig(
  guildId: string,
  config: Partial<{ 
    enabled: boolean; 
    voiceChannelId?: string | null;
    categoryId?: string | null;
    defaultUserLimit?: number;
  }>
): Promise<ZiGuildConfig | null> {
  try {
    const response = await botApiRequest<BotApiResponse>(
      `/bot/guilds/${guildId}/config/join-to-create`,
      {
        method: "PUT",
        body: JSON.stringify(config),
      }
    );

    if (!response.success) {
      console.error(`[v0] Failed to update join-to-create config for ${guildId}`);
      return null;
    }

    return response.data as ZiGuildConfig;
  } catch (error) {
    console.error(`[v0] Failed to update join-to-create config for ${guildId}:`, error);
    return null;
  }
}

/**
 * Add blocked user to join-to-create
 */
export async function blockUserFromJoinToCreate(
  guildId: string,
  userId: string
): Promise<ZiGuildConfig | null> {
  try {
    const response = await botApiRequest<BotApiResponse>(
      `/bot/guilds/${guildId}/config/join-to-create/block`,
      {
        method: "POST",
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.success) {
      console.error(`[v0] Failed to block user for ${guildId}`);
      return null;
    }

    return response.data as ZiGuildConfig;
  } catch (error) {
    console.error(`[v0] Failed to block user for ${guildId}:`, error);
    return null;
  }
}

/**
 * Remove blocked user from join-to-create
 */
export async function unblockUserFromJoinToCreate(
  guildId: string,
  userId: string
): Promise<ZiGuildConfig | null> {
  try {
    const response = await botApiRequest<BotApiResponse>(
      `/bot/guilds/${guildId}/config/join-to-create/unblock`,
      {
        method: "POST",
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.success) {
      console.error(`[v0] Failed to unblock user for ${guildId}`);
      return null;
    }

    return response.data as ZiGuildConfig;
  } catch (error) {
    console.error(`[v0] Failed to unblock user for ${guildId}:`, error);
    return null;
  }
}

/**
 * Update auto role configuration
 */
export async function updateAutoRoleConfig(
  guildId: string,
  config: { enabled: boolean; roleIds: string[] }
): Promise<ZiGuildConfig | null> {
  try {
    const response = await botApiRequest<BotApiResponse>(
      `/bot/guilds/${guildId}/config/auto-role`,
      {
        method: "PUT",
        body: JSON.stringify(config),
      }
    );

    if (!response.success) {
      console.error(`[v0] Failed to update auto-role config for ${guildId}`);
      return null;
    }

    return response.data as ZiGuildConfig;
  } catch (error) {
    console.error(`[v0] Failed to update auto-role config for ${guildId}:`, error);
    return null;
  }
}

/**
 * Get default ZiGuild configuration
 */
export function getDefaultGuildConfig(guildId: string): ZiGuildConfig {
  return {
    guildId,
    voice: {
      logMode: false,
    },
    joinToCreate: {
      enabled: false,
      voiceChannelId: null,
      categoryId: null,
      defaultUserLimit: 0,
      tempChannels: [],
      blockedUser: [],
    },
    autoRole: {
      enabled: false,
      roleIds: [],
    },
    updatedAt: new Date(),
  };
}

/**
 * Get or create ZiGuild configuration
 */
export async function getOrCreateGuildConfig(
  guildId: string
): Promise<ZiGuildConfig> {
  try {
    let config = await getGuildConfig(guildId);

    if (!config) {
      config = await createGuildConfig(guildId);
      
      if (!config) {
        // Return default config if creation fails (development fallback)
        console.warn(`[v0] Returning default config for ${guildId}`);
        return getDefaultGuildConfig(guildId);
      }
    }

    return config;
  } catch (error) {
    console.error(`[v0] Failed to get or create guild config for ${guildId}:`, error);
    return getDefaultGuildConfig(guildId);
  }
}
