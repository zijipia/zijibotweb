# Bot Server Setup - API Routes Implementation

## Overview

The web dashboard requires 7 API endpoints on your bot server. These are implemented in `bot-server-routes.js`.

## Quick Setup (2 steps)

### Step 1: Copy `bot-server-routes.js` to Your Bot Server

```bash
# In your Ziji-bot-discord project root
cp bot-server-routes.js ./routes/api/
```

### Step 2: Register Routes in Your Express App

In your main bot server file (likely `index.js` or where you initialize Express):

```javascript
// At the top with other requires
const botApiRoutes = require('./routes/api/bot-server-routes');

// In your app setup (after you initialize express)
const app = express();

// Register bot API routes
app.use('/bot', botApiRoutes);

console.log('Bot API endpoints registered at /bot');
```

## Required MongoDB Collections

The API routes expect 3 MongoDB collections:

### 1. `user_discord_sessions`
Stores user Discord sessions with access tokens.

```javascript
{
  userId: "661968947327008768",
  discordAccessToken: "access_token_here",
  username: "username",
  avatar: "avatar_url",
  email: "user@example.com",
  lastLogin: Date,
  updatedAt: Date,
  createdAt: Date
}
```

### 2. `user_guilds`
Caches user's Discord server list.

```javascript
{
  userId: "661968947327008768",
  guilds: [
    {
      id: "guild_id",
      name: "Server Name",
      icon: "icon_url",
      owner: true,
      permissions: "1024"
    }
  ],
  updatedAt: Date,
  createdAt: Date
}
```

### 3. `server_configs`
Stores bot configuration for each server.

```javascript
{
  serverId: "guild_id",
  prefix: "!",
  language: "en",
  modRole: null,
  logChannel: null,
  autorole: false,
  autoroleIds: [],
  customCommands: [],
  updatedAt: Date,
  createdAt: Date
}
```

## Testing the Setup

### 1. Test Health Check
```bash
curl https://api.ziji.world/bot/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Bot API is running"
}
```

### 2. Test Get User Guilds
```bash
curl https://api.ziji.world/bot/users/661968947327008768/guilds
```

Expected response:
```json
{
  "success": true,
  "data": []
}
```

### 3. Test Save User Session
```bash
curl -X POST https://api.ziji.world/bot/users/661968947327008768/session \
  -H "Content-Type: application/json" \
  -d '{
    "discordAccessToken": "token_here",
    "userInfo": {
      "username": "testuser",
      "avatar": "avatar_url",
      "email": "test@example.com"
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "userId": "661968947327008768",
    "saved": true
  }
}
```

## API Endpoints Reference

### User Endpoints

#### GET `/bot/users/:userId/guilds`
Get all Discord servers where user is a member.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "guild_id",
      "name": "Server Name",
      "icon": "icon_url",
      "owner": true,
      "permissions": "1024"
    }
  ]
}
```

#### POST `/bot/users/:userId/session`
Save user Discord session with access token.

**Body:**
```json
{
  "discordAccessToken": "access_token",
  "userInfo": {
    "username": "username",
    "avatar": "avatar_url",
    "email": "user@example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_id",
    "saved": true
  }
}
```

#### POST `/bot/users/:userId/guilds`
Save user's guild list (cache from Discord).

**Body:**
```json
{
  "guilds": [
    {
      "id": "guild_id",
      "name": "Server Name",
      "icon": "icon_url",
      "owner": true,
      "permissions": "1024"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_id",
    "count": 1
  }
}
```

#### GET `/bot/users/:userId/servers/:serverId/admin`
Check if user is admin (owner) of a server.

**Response:**
```json
{
  "success": true,
  "data": {
    "isAdmin": true,
    "userId": "user_id",
    "serverId": "server_id",
    "guildName": "Server Name"
  }
}
```

### Server Config Endpoints

#### GET `/bot/servers/:serverId/config`
Get server configuration.

**Response:**
```json
{
  "success": true,
  "data": {
    "serverId": "server_id",
    "prefix": "!",
    "language": "en",
    "modRole": null,
    "logChannel": null,
    "autorole": false,
    "autoroleIds": [],
    "customCommands": []
  }
}
```

#### POST `/bot/servers/:serverId/config`
Update server configuration.

**Body:**
```json
{
  "prefix": "!",
  "language": "en",
  "modRole": "role_id",
  "logChannel": "channel_id",
  "autorole": true,
  "autoroleIds": ["role_id1", "role_id2"],
  "customCommands": [
    {
      "name": "command",
      "response": "response text"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "serverId": "server_id",
    "updated": true
  }
}
```

#### GET `/bot/servers/:serverId/info`
Get server information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "server_id",
    "name": "Server Name",
    "icon": "icon_url",
    "memberCount": 100,
    "ownerId": "owner_id"
  }
}
```

## Environment Variables

Make sure your bot server has these set:
- `NODE_ENV` - Set to `production` for deployment
- `PORT` - Port your bot server runs on (default: 3000)
- `MONGO_URI` - MongoDB connection string (if using MongoDB)

## Troubleshooting

### 404 Errors
Make sure the routes are registered in Express with the correct prefix:
```javascript
app.use('/bot', botApiRoutes);
```

### Database Connection Issues
Verify MongoDB is connected before API requests:
```javascript
const db = useHooks.get("db");
if (!db) {
  console.error('Database not connected');
  // Handle error
}
```

### CORS Issues (if needed)
If the dashboard can't reach the API, add CORS middleware:
```javascript
const cors = require('cors');
app.use(cors());
```

## Next Steps

1. Copy `bot-server-routes.js` to your bot server
2. Register the routes in your Express app
3. Verify MongoDB collections exist
4. Test the health check endpoint
5. Test the web dashboard - it should now work!

## Support

If you encounter issues:
1. Check bot server logs for errors
2. Verify MongoDB collections exist and have data
3. Test endpoints with curl
4. Check web dashboard console for API errors
