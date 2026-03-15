/**
 * Ziji Bot Discord - API Routes for Web Dashboard Integration
 * 
 * Add these routes to your Express bot server to enable the web dashboard
 * Place this file in your bot server and register it with:
 * app.use('/bot', require('./bot-server-routes.js'));
 */

const express = require('express');
const router = express.Router();

// Get the database from zihooks
// Assuming your bot initializes: const { useHooks } = require("zihooks");
// And you have: const db = useHooks.get("db");

/**
 * GET /bot/users/:userId/guilds
 * Get all Discord servers (guilds) where user is a member
 */
router.get('/users/:userId/guilds', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get guilds from your stored data
    // Assuming you have a collection that stores user guild information
    const db = useHooks.get("db");
    
    const userGuilds = await db
      .collection('user_guilds')
      .findOne({ userId });

    if (!userGuilds) {
      return res.json({
        success: true,
        data: []
      });
    }

    return res.json({
      success: true,
      data: userGuilds.guilds || []
    });
  } catch (error) {
    console.error('[Bot API] Error getting user guilds:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /bot/users/:userId/session
 * Save user Discord session with access token
 */
router.post('/users/:userId/session', async (req, res) => {
  try {
    const { userId } = req.params;
    const { discordAccessToken, userInfo } = req.body;

    if (!discordAccessToken || !userInfo) {
      return res.status(400).json({
        success: false,
        error: 'Missing discordAccessToken or userInfo'
      });
    }

    const db = useHooks.get("db");

    // Save or update user session
    const result = await db
      .collection('user_discord_sessions')
      .updateOne(
        { userId },
        {
          $set: {
            userId,
            discordAccessToken,
            username: userInfo.username,
            avatar: userInfo.avatar,
            email: userInfo.email,
            lastLogin: new Date(),
            updatedAt: new Date(),
            createdAt: new Date()
          }
        },
        { upsert: true }
      );

    return res.json({
      success: true,
      data: { userId, saved: true }
    });
  } catch (error) {
    console.error('[Bot API] Error saving user session:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /bot/users/:userId/guilds
 * Save user's guild list (cache from Discord)
 */
router.post('/users/:userId/guilds', async (req, res) => {
  try {
    const { userId } = req.params;
    const { guilds } = req.body;

    if (!Array.isArray(guilds)) {
      return res.status(400).json({
        success: false,
        error: 'guilds must be an array'
      });
    }

    const db = useHooks.get("db");

    // Process and store guilds
    const processedGuilds = guilds.map(g => ({
      id: g.id,
      name: g.name,
      icon: g.icon,
      owner: g.owner,
      permissions: g.permissions,
      permissionsNew: g.permissions_new
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
            createdAt: new Date()
          }
        },
        { upsert: true }
      );

    return res.json({
      success: true,
      data: { userId, count: guilds.length }
    });
  } catch (error) {
    console.error('[Bot API] Error saving user guilds:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /bot/users/:userId/servers/:serverId/admin
 * Check if user is admin (owner) of a server
 */
router.get('/users/:userId/servers/:serverId/admin', async (req, res) => {
  try {
    const { userId, serverId } = req.params;

    const db = useHooks.get("db");

    // Get user's guilds
    const userGuilds = await db
      .collection('user_guilds')
      .findOne({ userId });

    if (!userGuilds || !userGuilds.guilds) {
      return res.json({
        success: true,
        data: { isAdmin: false, userId, serverId }
      });
    }

    // Check if user is owner of this server
    const guild = userGuilds.guilds.find(g => g.id === serverId);
    const isAdmin = guild && guild.owner === true;

    return res.json({
      success: true,
      data: { isAdmin, userId, serverId, guildName: guild?.name }
    });
  } catch (error) {
    console.error('[Bot API] Error checking admin status:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /bot/servers/:serverId/config
 * Get server configuration
 */
router.get('/servers/:serverId/config', async (req, res) => {
  try {
    const { serverId } = req.params;

    const db = useHooks.get("db");

    // Get server config
    const config = await db
      .collection('server_configs')
      .findOne({ serverId });

    // Return config or default
    const defaultConfig = {
      serverId,
      prefix: '!',
      language: 'en',
      modRole: null,
      logChannel: null,
      autorole: false,
      autoroleIds: [],
      customCommands: []
    };

    return res.json({
      success: true,
      data: config || defaultConfig
    });
  } catch (error) {
    console.error('[Bot API] Error getting server config:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /bot/servers/:serverId/config
 * Update server configuration
 */
router.post('/servers/:serverId/config', async (req, res) => {
  try {
    const { serverId } = req.params;
    const config = req.body;

    if (!config || typeof config !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid config object'
      });
    }

    const db = useHooks.get("db");

    // Update config
    const result = await db
      .collection('server_configs')
      .updateOne(
        { serverId },
        {
          $set: {
            serverId,
            ...config,
            updatedAt: new Date(),
            createdAt: new Date()
          }
        },
        { upsert: true }
      );

    return res.json({
      success: true,
      data: { serverId, updated: true }
    });
  } catch (error) {
    console.error('[Bot API] Error updating server config:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /bot/servers/:serverId/info
 * Get server information (name, icon, member count, etc)
 */
router.get('/servers/:serverId/info', async (req, res) => {
  try {
    const { serverId } = req.params;

    // If you have a Discord bot client, you can get the guild
    // For now, return basic info structure
    // You might want to integrate with your bot's guild cache

    return res.json({
      success: true,
      data: {
        id: serverId,
        name: 'Server Name',
        icon: null,
        memberCount: 0,
        ownerId: null
        // Add more fields as needed
      }
    });
  } catch (error) {
    console.error('[Bot API] Error getting server info:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /bot/api/health
 * Health check endpoint
 */
router.get('/api/health', (req, res) => {
  return res.json({
    success: true,
    message: 'Bot API is running'
  });
});

module.exports = router;
