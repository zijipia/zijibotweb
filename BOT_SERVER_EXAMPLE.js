/**
 * Bot Server API Routes Example
 * 
 * Add these routes to your Ziji-bot-discord server's Express app
 * This is an example using the structure shown in the user's index.js
 * 
 * File: src/routes/api.js or similar
 */

const express = require('express');
const router = express.Router();
const { useHooks } = require('zihooks');

// Middleware to get DB instance
const getDB = () => {
  try {
    return useHooks.get('db');
  } catch (error) {
    console.error('[Bot API] Failed to get DB:', error);
    return null;
  }
};

// ============ USER ENDPOINTS ============

/**
 * GET /bot/users/:userId/guilds
 * Get all Discord servers/guilds that a user owns or has admin access to
 */
router.get('/users/:userId/guilds', async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database not available',
      });
    }

    const { userId } = req.params;

    // Get cached user guilds
    const userGuilds = await db.collection('user_guilds').findOne({
      userId,
    });

    if (!userGuilds) {
      return res.json({
        success: true,
        data: [],
      });
    }

    res.json({
      success: true,
      data: userGuilds.guilds || [],
    });
  } catch (error) {
    console.error('[Bot API] Error fetching user guilds:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /bot/users/:userId/session
 * Save user Discord session with access token
 */
router.post('/users/:userId/session', async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database not available',
      });
    }

    const { userId } = req.params;
    const { discordAccessToken, userInfo } = req.body;

    if (!discordAccessToken) {
      return res.status(400).json({
        success: false,
        error: 'discordAccessToken is required',
      });
    }

    const result = await db.collection('user_discord_sessions').updateOne(
      { userId },
      {
        $set: {
          userId,
          discordAccessToken,
          userInfo: userInfo || {},
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    res.json({
      success: true,
      data: {
        userId,
        saved: result.acknowledged,
      },
    });
  } catch (error) {
    console.error('[Bot API] Error saving user session:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /bot/users/:userId/guilds
 * Save user's guilds list
 */
router.post('/users/:userId/guilds', async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database not available',
      });
    }

    const { userId } = req.params;
    const { guilds } = req.body;

    if (!Array.isArray(guilds)) {
      return res.status(400).json({
        success: false,
        error: 'guilds must be an array',
      });
    }

    const result = await db.collection('user_guilds').updateOne(
      { userId },
      {
        $set: {
          userId,
          guilds,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    res.json({
      success: true,
      data: {
        userId,
        guildCount: guilds.length,
      },
    });
  } catch (error) {
    console.error('[Bot API] Error saving user guilds:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /bot/users/:userId/servers/:serverId/admin
 * Check if user has admin access to a server
 */
router.get('/users/:userId/servers/:serverId/admin', async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database not available',
      });
    }

    const { userId, serverId } = req.params;

    // Get user's guilds
    const userGuilds = await db.collection('user_guilds').findOne({
      userId,
    });

    if (!userGuilds) {
      return res.json({
        success: true,
        data: {
          isAdmin: false,
          userId,
          serverId,
        },
      });
    }

    // Check if user owns or has admin in the server
    const serverGuild = userGuilds.guilds.find((g) => g.id === serverId);
    const isAdmin = serverGuild && (serverGuild.owner === true);

    res.json({
      success: true,
      data: {
        isAdmin,
        userId,
        serverId,
      },
    });
  } catch (error) {
    console.error('[Bot API] Error checking admin status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============ SERVER/GUILD ENDPOINTS ============

/**
 * GET /bot/servers/:serverId/config
 * Get the bot configuration for a server
 */
router.get('/servers/:serverId/config', async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database not available',
      });
    }

    const { serverId } = req.params;

    const config = await db.collection('server_configs').findOne({
      serverId,
    });

    // Return existing config or default
    const defaultConfig = {
      serverId,
      prefix: '!',
      language: 'en',
      modRole: null,
      logChannel: null,
      autorole: false,
      autoroleIds: [],
      customCommands: [],
    };

    res.json({
      success: true,
      data: config || defaultConfig,
    });
  } catch (error) {
    console.error('[Bot API] Error fetching server config:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /bot/servers/:serverId/config
 * Update the bot configuration for a server
 */
router.post('/servers/:serverId/config', async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database not available',
      });
    }

    const { serverId } = req.params;
    const config = req.body;

    const result = await db.collection('server_configs').updateOne(
      { serverId },
      {
        $set: {
          serverId,
          ...config,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    // TODO: Broadcast config change to bot for real-time reload
    // const wss = useHooks.get('wss');
    // if (wss) {
    //   wss.broadcast('config:updated', { serverId, config });
    // }

    res.json({
      success: true,
      message: 'Config updated successfully',
      data: {
        serverId,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('[Bot API] Error updating server config:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /bot/servers/:serverId/info
 * Get basic information about a server
 */
router.get('/servers/:serverId/info', async (req, res) => {
  try {
    const { serverId } = req.params;
    const client = useHooks.get('client');

    if (!client) {
      return res.status(500).json({
        success: false,
        error: 'Bot client not available',
      });
    }

    const guild = client.guilds.cache.get(serverId);

    if (!guild) {
      return res.status(404).json({
        success: false,
        error: 'Server not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        memberCount: guild.memberCount,
        owner: guild.ownerId,
      },
    });
  } catch (error) {
    console.error('[Bot API] Error fetching server info:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

/**
 * USAGE in your bot server's main file (e.g., index.js):
 * 
 * const apiRoutes = require('./routes/api');
 * app.use('/bot', apiRoutes);
 * 
 * Now all routes will be available at:
 * - GET  /bot/users/:userId/guilds
 * - POST /bot/users/:userId/session
 * - POST /bot/users/:userId/guilds
 * - GET  /bot/users/:userId/servers/:serverId/admin
 * - GET  /bot/servers/:serverId/config
 * - POST /bot/servers/:serverId/config
 * - GET  /bot/servers/:serverId/info
 */
