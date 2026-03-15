/**
 * DEPRECATED - This file is no longer used in the web dashboard
 * 
 * The web dashboard now communicates with the bot server via API endpoints
 * instead of directly accessing MongoDB.
 * 
 * All database operations should use /lib/bot-api.ts instead.
 * 
 * See BOT_API_ENDPOINTS.md for the new API structure.
 * 
 * This file is kept for reference only. Remove it if not needed.
 */

// Type definitions
export interface BotServerConfig {
  serverId: string;
  prefix: string;
  language: string;
  modRole: string | null;
  logChannel: string | null;
  autorole: boolean;
  autoroleIds: string[];
  customCommands: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Get database instance from zihooks
 * This is a placeholder - implement based on your bot's setup
 */
export async function getDB() {
  try {
    // If zihooks is available in your environment
    if (typeof require !== 'undefined') {
      const { useHooks } = require('zihooks');
      return useHooks.get('db');
    }

    // Fallback: Return mock DB for development
    console.warn('[v0] Using mock database - implement real MongoDB connection');
    return null;
  } catch (error) {
    console.error('[v0] Failed to get database:', error);
    return null;
  }
}

/**
 * Get server configuration
 */
export async function getServerConfig(
  serverId: string
): Promise<BotServerConfig | null> {
  const db = await getDB();
  if (!db) return null;

  try {
    const config = await db
      .collection('bot_configs')
      .findOne({ serverId });

    return config || null;
  } catch (error) {
    console.error('[v0] Error getting server config:', error);
    return null;
  }
}

/**
 * Update server configuration
 */
export async function updateServerConfig(
  serverId: string,
  config: Partial<BotServerConfig>
): Promise<boolean> {
  const db = await getDB();
  if (!db) return false;

  try {
    const result = await db
      .collection('bot_configs')
      .updateOne(
        { serverId },
        {
          $set: {
            ...config,
            serverId,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );

    return result.acknowledged;
  } catch (error) {
    console.error('[v0] Error updating server config:', error);
    return false;
  }
}

/**
 * Create server configuration
 */
export async function createServerConfig(
  serverId: string,
  config: Omit<BotServerConfig, 'createdAt' | 'updatedAt'>
): Promise<BotServerConfig | null> {
  const db = await getDB();
  if (!db) return null;

  try {
    const newConfig: BotServerConfig = {
      ...config,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('bot_configs').insertOne(newConfig);
    return newConfig;
  } catch (error) {
    console.error('[v0] Error creating server config:', error);
    return null;
  }
}

/**
 * Delete server configuration
 */
export async function deleteServerConfig(serverId: string): Promise<boolean> {
  const db = await getDB();
  if (!db) return false;

  try {
    const result = await db
      .collection('bot_configs')
      .deleteOne({ serverId });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('[v0] Error deleting server config:', error);
    return false;
  }
}

/**
 * Get all server configurations for a user (all servers they own)
 */
export async function getUserServerConfigs(
  guildIds: string[]
): Promise<BotServerConfig[]> {
  const db = await getDB();
  if (!db) return [];

  try {
    const configs = await db
      .collection('bot_configs')
      .find({ serverId: { $in: guildIds } })
      .toArray();

    return configs;
  } catch (error) {
    console.error('[v0] Error getting user server configs:', error);
    return [];
  }
}

/**
 * Store user session
 */
export async function storeUserSession(
  userId: string,
  token: string,
  expiresAt: Date
): Promise<boolean> {
  const db = await getDB();
  if (!db) return false;

  try {
    const result = await db
      .collection('user_sessions')
      .updateOne(
        { userId },
        {
          $set: {
            userId,
            token,
            expiresAt,
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

    return result.acknowledged;
  } catch (error) {
    console.error('[v0] Error storing user session:', error);
    return false;
  }
}

/**
 * Get user session
 */
export async function getUserSession(token: string): Promise<UserSession | null> {
  const db = await getDB();
  if (!db) return null;

  try {
    const session = await db
      .collection('user_sessions')
      .findOne({ token });

    if (!session) return null;

    // Check if token is expired
    if (session.expiresAt < new Date()) {
      // Delete expired token
      await db.collection('user_sessions').deleteOne({ token });
      return null;
    }

    return session;
  } catch (error) {
    console.error('[v0] Error getting user session:', error);
    return null;
  }
}

/**
 * Delete user session
 */
export async function deleteUserSession(token: string): Promise<boolean> {
  const db = await getDB();
  if (!db) return false;

  try {
    const result = await db
      .collection('user_sessions')
      .deleteOne({ token });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('[v0] Error deleting user session:', error);
    return false;
  }
}

/**
 * Save user Discord session with access token
 */
export async function saveUserSession(
  userId: string,
  discordAccessToken: string
): Promise<boolean> {
  const db = await getDB();
  if (!db) {
    console.log('[v0] Database not available, skipping user session save');
    return false;
  }

  try {
    const result = await db
      .collection('user_discord_sessions')
      .updateOne(
        { userId },
        {
          $set: {
            userId,
            discordAccessToken,
            updatedAt: new Date(),
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

    console.log('[v0] User session saved:', userId);
    return result.acknowledged;
  } catch (error) {
    console.error('[v0] Error saving user session:', error);
    return false;
  }
}

/**
 * Get user Discord access token
 */
export async function getUserAccessToken(userId: string): Promise<string | null> {
  const db = await getDB();
  if (!db) return null;

  try {
    const session = await db
      .collection('user_discord_sessions')
      .findOne({ userId });

    return session?.discordAccessToken || null;
  } catch (error) {
    console.error('[v0] Error getting user access token:', error);
    return null;
  }
}

/**
 * Save user guilds (Discord server list with metadata)
 */
export async function saveUserGuilds(userId: string, guilds: any[]): Promise<boolean> {
  const db = await getDB();
  if (!db) {
    console.log('[v0] Database not available, skipping guilds save');
    return false;
  }

  try {
    const processedGuilds = guilds.map((g: any) => ({
      id: g.id,
      name: g.name,
      icon: g.icon,
      owner: g.owner,
      permissions: g.permissions,
      permissionsNew: g.permissions_new,
    }));

    const result = await db
      .collection('user_guilds')
      .updateOne(
        { userId },
        {
          $set: {
            userId,
            guilds: processedGuilds,
            updatedAt: new Date(),
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

    console.log('[v0] User guilds saved:', userId, `(${guilds.length} guilds)`);
    return result.acknowledged;
  } catch (error) {
    console.error('[v0] Error saving user guilds:', error);
    return false;
  }
}

/**
 * Get user guilds from cache
 */
export async function getUserGuilds(userId: string): Promise<any[]> {
  const db = await getDB();
  if (!db) return [];

  try {
    const result = await db
      .collection('user_guilds')
      .findOne({ userId });

    return result?.guilds || [];
  } catch (error) {
    console.error('[v0] Error getting user guilds:', error);
    return [];
  }
}
