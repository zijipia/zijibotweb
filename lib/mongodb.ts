/**
 * MongoDB Integration Template
 * 
 * This file shows how to integrate with your bot's MongoDB instance
 * using zihooks.get("db")
 * 
 * Usage in API routes:
 * import { getDB } from '@/lib/mongodb';
 * const db = await getDB();
 * const collection = db.collection('bot_configs');
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
