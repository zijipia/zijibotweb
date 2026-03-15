# Bot Server API Endpoints

This document outlines the required API endpoints that must be implemented in the Ziji-bot-discord server to support the web dashboard.

**Base URL:** `https://api.ziji.world/`

## User Endpoints

### GET `/bot/users/:userId/guilds`
Get all Discord servers/guilds that a user owns or has admin access to.

**Parameters:**
- `userId` (path): Discord user ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "123456789",
      "name": "My Server",
      "icon": "a_1234567890abcdef",
      "owner": true,
      "permissions": "8",
      "permissionsNew": "0"
    }
  ]
}
```

### POST `/bot/users/:userId/session`
Save user Discord session with access token for later API calls.

**Parameters:**
- `userId` (path): Discord user ID

**Body:**
```json
{
  "discordAccessToken": "access_token_here",
  "userInfo": {
    "username": "username",
    "avatar": "avatar_hash",
    "email": "user@example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "123456789",
    "saved": true
  }
}
```

### POST `/bot/users/:userId/guilds`
Save/cache user's guilds list for quick retrieval without API calls to Discord.

**Parameters:**
- `userId` (path): Discord user ID

**Body:**
```json
{
  "guilds": [
    {
      "id": "123456789",
      "name": "My Server",
      "icon": "a_1234567890abcdef",
      "owner": true,
      "permissions": "8"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "123456789",
    "guildCount": 1
  }
}
```

### GET `/bot/users/:userId/servers/:serverId/admin`
Check if a user has admin access to a specific server.

**Parameters:**
- `userId` (path): Discord user ID
- `serverId` (path): Discord server/guild ID

**Response:**
```json
{
  "success": true,
  "data": {
    "isAdmin": true,
    "userId": "123456789",
    "serverId": "987654321"
  }
}
```

## Server/Guild Endpoints

### GET `/bot/servers/:serverId/config`
Get the bot configuration for a specific server.

**Parameters:**
- `serverId` (path): Discord server/guild ID

**Response:**
```json
{
  "success": true,
  "data": {
    "serverId": "987654321",
    "prefix": "!",
    "language": "en",
    "modRole": "123456789",
    "logChannel": "123456789",
    "autorole": false,
    "autoroleIds": ["123456789"],
    "customCommands": [
      {
        "name": "ping",
        "response": "Pong!"
      }
    ]
  }
}
```

### POST `/bot/servers/:serverId/config`
Update the bot configuration for a specific server.

**Parameters:**
- `serverId` (path): Discord server/guild ID

**Body:**
```json
{
  "prefix": "!",
  "language": "en",
  "modRole": "123456789",
  "logChannel": "123456789",
  "autorole": true,
  "autoroleIds": ["123456789", "987654321"],
  "customCommands": [
    {
      "name": "ping",
      "response": "Pong!"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Config updated successfully",
  "data": {
    "serverId": "987654321",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### GET `/bot/servers/:serverId/info`
Get basic information about a server.

**Parameters:**
- `serverId` (path): Discord server/guild ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "987654321",
    "name": "My Server",
    "icon": "a_1234567890abcdef",
    "memberCount": 150,
    "owner": "123456789"
  }
}
```

## Implementation Guide

### Using zihooks.get("db") in Bot Server

In your bot server's route handlers, you can access the MongoDB connection like this:

```javascript
const { useHooks } = require('zihooks');

// In your route handler:
const db = useHooks.get('db');

// Get user guilds
const userGuilds = await db.collection('user_guilds').findOne({ userId });

// Save server config
await db.collection('server_configs').updateOne(
  { serverId },
  { $set: { ...config, updatedAt: new Date() } },
  { upsert: true }
);
```

### Error Responses

All endpoints should return proper error responses:

```json
{
  "success": false,
  "error": "User not found or does not have access to this server"
}
```

**Common Error Codes:**
- 400: Bad request (missing parameters)
- 401: Unauthorized (invalid auth)
- 403: Forbidden (user doesn't have permission)
- 404: Not found
- 500: Internal server error

## Environment Variables

Add to your bot server `.env`:

```
# Web Dashboard URL for CORS
WEB_DASHBOARD_URL=https://yourdomain.com

# MongoDB connection
MONGODB_URI=mongodb://...
```

## Example Implementation (Express.js)

```javascript
const express = require('express');
const router = express.Router();
const { useHooks } = require('zihooks');

// GET /bot/users/:userId/guilds
router.get('/users/:userId/guilds', async (req, res) => {
  try {
    const db = useHooks.get('db');
    const userGuilds = await db.collection('user_guilds').findOne({
      userId: req.params.userId
    });

    if (!userGuilds) {
      return res.json({
        success: true,
        data: []
      });
    }

    res.json({
      success: true,
      data: userGuilds.guilds || []
    });
  } catch (error) {
    console.error('Error fetching user guilds:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /bot/servers/:serverId/config
router.post('/servers/:serverId/config', async (req, res) => {
  try {
    const db = useHooks.get('db');
    const { serverId } = req.params;
    const config = req.body;

    const result = await db.collection('server_configs').updateOne(
      { serverId },
      {
        $set: {
          ...config,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Config updated successfully',
      data: { serverId, updatedAt: new Date() }
    });
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
```

## Testing

You can test the endpoints using curl:

```bash
# Get user guilds
curl https://api.ziji.world/bot/users/123456789/guilds

# Update server config
curl -X POST https://api.ziji.world/bot/servers/987654321/config \
  -H "Content-Type: application/json" \
  -d '{"prefix":"!","language":"en"}'
```

## Migration from Old MongoDB Setup

If you had MongoDB calls in the web dashboard, they should now be replaced with bot API calls. The bot server acts as the single source of truth for all configuration data.

**Old Way (Web Dashboard → MongoDB):**
```
Web Dashboard → MongoDB
```

**New Way (Web Dashboard → Bot Server → MongoDB):**
```
Web Dashboard → Bot API → MongoDB
```

This ensures:
1. Centralized data management on the bot server
2. Consistent data format and validation
3. Real-time bot reloading when config changes
4. Security: Web dashboard doesn't need direct DB access
