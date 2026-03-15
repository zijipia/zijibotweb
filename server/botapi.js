const express = require("express");
const router = express.Router();

const { useHooks } = require("zihooks");

// Middleware to get DB instance
const getDB = () => {
	try {
		return useHooks.get("db");
	} catch (error) {
		console.error("[Bot API] Failed to get DB:", error);
		return null;
	}
};

// ============ USER ENDPOINTS ============

/**
 * GET /bot/users/:userId/guilds
 * Get all Discord servers/guilds that a user owns or has admin access to
 */
router.get("/users/:userId/guilds", async (req, res) => {
	try {
		const db = getDB();
		if (!db) {
			return res.status(500).json({
				success: false,
				error: "Database not available",
			});
		}

		const { userId } = req.params;

		// Get cached user guilds using ZiUser model
		const user = await db.ZiUser.findOne({
			userId,
		});

		if (!user || !user.guilds) {
			return res.json({
				success: true,
				data: [],
			});
		}

		res.json({
			success: true,
			data: user.guilds || [],
		});
	} catch (error) {
		console.error("[Bot API] Error fetching user guilds:", error);
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
router.post("/users/:userId/session", async (req, res) => {
	try {
		const db = getDB();
		if (!db) {
			return res.status(500).json({
				success: false,
				error: "Database not available",
			});
		}

		const { userId } = req.params;
		const { discordAccessToken, userInfo } = req.body;

		if (!discordAccessToken) {
			return res.status(400).json({
				success: false,
				error: "discordAccessToken is required",
			});
		}

		const result = await db.ZiUser.updateOne(
			{ userId },
			{
				$set: {
					userId,
					discordAccessToken,
					userInfo: userInfo || {},
					updatedAt: new Date(),
				},
			},
			{ upsert: true },
		);

		res.json({
			success: true,
			data: {
				userId,
				saved: result.acknowledged,
			},
		});
	} catch (error) {
		console.error("[Bot API] Error saving user session:", error);
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
router.post("/users/:userId/guilds", async (req, res) => {
	try {
		const db = getDB();
		if (!db) {
			return res.status(500).json({
				success: false,
				error: "Database not available",
			});
		}

		const { userId } = req.params;
		const { guilds } = req.body;

		if (!Array.isArray(guilds)) {
			return res.status(400).json({
				success: false,
				error: "guilds must be an array",
			});
		}

		const result = await db.ZiUser.updateOne(
			{ userId },
			{
				$set: {
					userId,
					guilds,
					updatedAt: new Date(),
				},
			},
			{ upsert: true },
		);

		res.json({
			success: true,
			data: {
				userId,
				guildCount: guilds.length,
			},
		});
	} catch (error) {
		console.error("[Bot API] Error saving user guilds:", error);
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
router.get("/users/:userId/servers/:serverId/admin", async (req, res) => {
	try {
		const db = getDB();
		if (!db) {
			return res.status(500).json({
				success: false,
				error: "Database not available",
			});
		}

		const { userId, serverId } = req.params;

		// Get user's guilds using ZiUser model
		const user = await db.ZiUser.findOne({
			userId,
		});

		if (!user || !user.guilds) {
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
		const serverGuild = user.guilds.find((g) => g.id === serverId);
		const isAdmin = serverGuild && serverGuild.owner === true;

		res.json({
			success: true,
			data: {
				isAdmin,
				userId,
				serverId,
			},
		});
	} catch (error) {
		console.error("[Bot API] Error checking admin status:", error);
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
router.get("/servers/:serverId/config", async (req, res) => {
	try {
		const db = getDB();
		if (!db) {
			return res.status(500).json({
				success: false,
				error: "Database not available",
			});
		}

		const { serverId } = req.params;

		const config = await db.ZiGuild.findOne({
			guildId: serverId,
		});

		// Return existing config or default
		const defaultConfig = {
			serverId,
			prefix: "!",
			language: "en",
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
		console.error("[Bot API] Error fetching server config:", error);
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
router.post("/servers/:serverId/config", async (req, res) => {
	try {
		const db = getDB();
		if (!db) {
			return res.status(500).json({
				success: false,
				error: "Database not available",
			});
		}

		const { serverId } = req.params;
		const config = req.body;

		const result = await db.ZiGuild.updateOne(
			{ guildId: serverId },
			{
				$set: {
					guildId: serverId,
					...config,
					updatedAt: new Date(),
				},
			},
			{ upsert: true },
		);

		// TODO: Broadcast config change to bot for real-time reload
		// const wss = useHooks.get('wss');
		// if (wss) {
		//   wss.broadcast('config:updated', { serverId, config });
		// }

		res.json({
			success: true,
			message: "Config updated successfully",
			data: {
				serverId,
				updatedAt: new Date(),
			},
		});
	} catch (error) {
		console.error("[Bot API] Error updating server config:", error);
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
router.get("/servers/:serverId/info", async (req, res) => {
	try {
		const { serverId } = req.params;
		const client = useHooks.get("client");

		if (!client) {
			return res.status(500).json({
				success: false,
				error: "Bot client not available",
			});
		}

		const guild = client.guilds.cache.get(serverId);

		if (!guild) {
			return res.status(404).json({
				success: false,
				error: "Server not found",
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
		console.error("[Bot API] Error fetching server info:", error);
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

/**
 * GET /bot/users/:userId/guilds
 * Get all Discord servers (guilds) where user is a member
 */
router.get("/users/:userId/guilds", async (req, res) => {
	try {
		const { userId } = req.params;

		// Get guilds from your stored data
		// Assuming you have a collection that stores user guild information
		const db = useHooks.get("db");

		const userGuilds = await db.collection("user_guilds").findOne({ userId });

		if (!userGuilds) {
			return res.json({
				success: true,
				data: [],
			});
		}

		return res.json({
			success: true,
			data: userGuilds.guilds || [],
		});
	} catch (error) {
		console.error("[Bot API] Error getting user guilds:", error);
		return res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

/**
 * POST /bot/users/:userId/session
 * Save user Discord session with access token
 */
router.post("/users/:userId/session", async (req, res) => {
	try {
		const { userId } = req.params;
		const { discordAccessToken, userInfo } = req.body;

		if (!discordAccessToken || !userInfo) {
			return res.status(400).json({
				success: false,
				error: "Missing discordAccessToken or userInfo",
			});
		}

		const db = useHooks.get("db");

		// Save or update user session
		const result = await db.collection("user_discord_sessions").updateOne(
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
					createdAt: new Date(),
				},
			},
			{ upsert: true },
		);

		return res.json({
			success: true,
			data: { userId, saved: true },
		});
	} catch (error) {
		console.error("[Bot API] Error saving user session:", error);
		return res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

/**
 * POST /bot/users/:userId/guilds
 * Save user's guild list (cache from Discord)
 */
router.post("/users/:userId/guilds", async (req, res) => {
	try {
		const { userId } = req.params;
		const { guilds } = req.body;

		if (!Array.isArray(guilds)) {
			return res.status(400).json({
				success: false,
				error: "guilds must be an array",
			});
		}

		const db = useHooks.get("db");

		// Process and store guilds
		const processedGuilds = guilds.map((g) => ({
			id: g.id,
			name: g.name,
			icon: g.icon,
			owner: g.owner,
			permissions: g.permissions,
			permissionsNew: g.permissions_new,
		}));

		const result = await db.collection("user_guilds").updateOne(
			{ userId },
			{
				$set: {
					userId,
					guilds: processedGuilds,
					updatedAt: new Date(),
					createdAt: new Date(),
				},
			},
			{ upsert: true },
		);

		return res.json({
			success: true,
			data: { userId, count: guilds.length },
		});
	} catch (error) {
		console.error("[Bot API] Error saving user guilds:", error);
		return res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

/**
 * GET /bot/users/:userId/servers/:serverId/admin
 * Check if user is admin (owner) of a server
 */
router.get("/users/:userId/servers/:serverId/admin", async (req, res) => {
	try {
		const { userId, serverId } = req.params;

		const db = useHooks.get("db");

		// Get user's guilds
		const userGuilds = await db.collection("user_guilds").findOne({ userId });

		if (!userGuilds || !userGuilds.guilds) {
			return res.json({
				success: true,
				data: { isAdmin: false, userId, serverId },
			});
		}

		// Check if user is owner of this server
		const guild = userGuilds.guilds.find((g) => g.id === serverId);
		const isAdmin = guild && guild.owner === true;

		return res.json({
			success: true,
			data: { isAdmin, userId, serverId, guildName: guild?.name },
		});
	} catch (error) {
		console.error("[Bot API] Error checking admin status:", error);
		return res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

/**
 * GET /bot/servers/:serverId/config
 * Get server configuration
 */
router.get("/servers/:serverId/config", async (req, res) => {
	try {
		const { serverId } = req.params;

		const db = useHooks.get("db");

		// Get server config
		const config = await db.collection("server_configs").findOne({ serverId });

		// Return config or default
		const defaultConfig = {
			serverId,
			prefix: "!",
			language: "en",
			modRole: null,
			logChannel: null,
			autorole: false,
			autoroleIds: [],
			customCommands: [],
		};

		return res.json({
			success: true,
			data: config || defaultConfig,
		});
	} catch (error) {
		console.error("[Bot API] Error getting server config:", error);
		return res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

/**
 * POST /bot/servers/:serverId/config
 * Update server configuration
 */
router.post("/servers/:serverId/config", async (req, res) => {
	try {
		const { serverId } = req.params;
		const config = req.body;

		if (!config || typeof config !== "object") {
			return res.status(400).json({
				success: false,
				error: "Invalid config object",
			});
		}

		const db = useHooks.get("db");

		// Update config
		const result = await db.collection("server_configs").updateOne(
			{ serverId },
			{
				$set: {
					serverId,
					...config,
					updatedAt: new Date(),
					createdAt: new Date(),
				},
			},
			{ upsert: true },
		);

		return res.json({
			success: true,
			data: { serverId, updated: true },
		});
	} catch (error) {
		console.error("[Bot API] Error updating server config:", error);
		return res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

/**
 * GET /bot/servers/:serverId/info
 * Get server information (name, icon, member count, etc)
 */
router.get("/servers/:serverId/info", async (req, res) => {
	try {
		const { serverId } = req.params;

		// If you have a Discord bot client, you can get the guild
		// For now, return basic info structure
		// You might want to integrate with your bot's guild cache

		return res.json({
			success: true,
			data: {
				id: serverId,
				name: "Server Name",
				icon: null,
				memberCount: 0,
				ownerId: null,
				// Add more fields as needed
			},
		});
	} catch (error) {
		console.error("[Bot API] Error getting server info:", error);
		return res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

/**
 * GET /bot/api/health
 * Health check endpoint
 */
router.get("/api/health", (req, res) => {
	return res.json({
		success: true,
		message: "Bot API is running",
	});
});

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

module.exports.data = {
	name: "APIRoutes",
	description: "Bot web control",
	version: "2.0.0",
	enable: true,
};

module.exports.execute = () => {
	const server = useHooks.get("server");
	server.use("/bot", router);
	return;
};
