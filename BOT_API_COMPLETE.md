# Bot API Integration - Complete Implementation Guide

## ✅ What's Been Done

The web dashboard has been **fully migrated** from direct MongoDB access to communicate exclusively through the Ziji-bot-discord server's API endpoints.

### Summary of Changes

**Web Dashboard → Bot Server API → MongoDB**

All database operations now flow through the bot server, making it the single source of truth.

## 📁 New Files Created

### 1. **`lib/bot-api.ts`** - Bot Server Client Library
Complete TypeScript client for all bot server communication.

**Functions:**
- `getBotUserGuilds(userId)` - Get user's Discord servers
- `saveBotUserSession(userId, token, userInfo)` - Save user session
- `saveBotUserGuilds(userId, guilds)` - Save user's guilds
- `getBotServerConfig(serverId)` - Get server configuration
- `updateBotServerConfig(serverId, config)` - Update server configuration
- `getBotServerInfo(serverId)` - Get server information
- `checkBotServerAdmin(userId, serverId)` - Check admin permission

### 2. **`BOT_API_ENDPOINTS.md`** - API Specification
Complete documentation of all required bot server endpoints with:
- Request/response formats
- Parameter descriptions
- Error codes
- Example implementations
- MongoDB query examples

### 3. **`BOT_SERVER_EXAMPLE.js`** - Ready-to-use Express Routes
Copy-paste ready implementation of all 7 required endpoints:
- GET `/bot/users/:userId/guilds`
- POST `/bot/users/:userId/session`
- POST `/bot/users/:userId/guilds`
- GET `/bot/users/:userId/servers/:serverId/admin`
- GET `/bot/servers/:serverId/config`
- POST `/bot/servers/:serverId/config`
- GET `/bot/servers/:serverId/info`

### 4. **`MIGRATION_TO_BOT_API.md`** - Migration Guide
Detailed guide covering:
- Before/after architecture
- Files changed and why
- Testing procedures
- Troubleshooting
- API response format

### 5. **`BOT_API_SETUP_SUMMARY.md`** - Quick Setup Guide
Fast-track setup instructions:
- What changed overview
- 5-step setup process
- Architecture diagram
- Benefits of new approach
- Support links

### 6. **`API_FLOW_DIAGRAMS.md`** - Visual Documentation
Detailed flow diagrams for:
- OAuth login flow
- Load servers flow
- Load config flow
- Save config flow
- Admin permission check
- Response formats
- MongoDB schema

### 7. **`IMPLEMENTATION_CHECKLIST.md`** - Step-by-Step Checklist
Complete checklist with:
- Phase 1: Web dashboard setup (5 items)
- Phase 2: Bot server preparation (20+ items)
- Phase 3: Testing (20+ items)
- Phase 4: Deployment (15 items)
- Phase 5: Monitoring (10 items)
- Troubleshooting guide (8 scenarios)

## 📝 Modified Files

### 1. **`/app/api/auth/callback/discord/route.ts`**
- Replaced: MongoDB saves
- Changed to: Bot API calls
- Functions used: `saveBotUserSession()`, `saveBotUserGuilds()`

### 2. **`/app/api/auth/guilds/route.ts`**
- Replaced: `getUserGuilds()` from MongoDB
- Changed to: `getBotUserGuilds()` from bot API

### 3. **`/app/api/config/route.ts`**
- Replaced: `getServerConfig()` from MongoDB
- Changed to: `getBotServerConfig()` from bot API
- Replaced: `updateServerConfig()` from MongoDB
- Changed to: `updateBotServerConfig()` from bot API
- Replaced: Direct guild access check
- Changed to: `getBotUserGuilds()` and `checkBotServerAdmin()` from bot API

### 4. **`/lib/mongodb.ts`**
- Marked as DEPRECATED
- All functions replaced by bot API calls
- Kept for reference only

## 🏗️ Architecture

```
┌────────────────────────────────────┐
│    Web Dashboard (Next.js)         │
│    - Pages                         │
│    - Components                    │
│    - API Routes (/api/*)           │
└──────────────┬─────────────────────┘
               │
               │ HTTP API Calls
               │ (credentials: include)
               │
               ▼
┌────────────────────────────────────┐
│    Bot Server API (Express.js)     │
│    - /bot/users/*                  │
│    - /bot/servers/*                │
│    - Authentication                │
│    - Authorization                 │
└──────────────┬─────────────────────┘
               │
               │ Database Access
               │ useHooks.get('db')
               │
               ▼
┌────────────────────────────────────┐
│    MongoDB                         │
│    - user_guilds                   │
│    - user_discord_sessions         │
│    - server_configs                │
└────────────────────────────────────┘
```

## 🚀 7 Bot Server Endpoints Required

| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 1 | GET | `/bot/users/:userId/guilds` | List user's Discord servers |
| 2 | POST | `/bot/users/:userId/session` | Save user Discord session |
| 3 | POST | `/bot/users/:userId/guilds` | Save user's servers list |
| 4 | GET | `/bot/users/:userId/servers/:serverId/admin` | Check admin permission |
| 5 | GET | `/bot/servers/:serverId/config` | Get server configuration |
| 6 | POST | `/bot/servers/:serverId/config` | Update server configuration |
| 7 | GET | `/bot/servers/:serverId/info` | Get server information |

All implementations are in `BOT_SERVER_EXAMPLE.js`

## 💾 MongoDB Collections Needed

### `user_guilds` Collection
```javascript
{
  userId: "discord_user_id",
  guilds: [{
    id: "server_id",
    name: "Server Name",
    icon: "icon_hash",
    owner: true,
    permissions: "8"
  }],
  updatedAt: Date,
  createdAt: Date
}
```

### `user_discord_sessions` Collection
```javascript
{
  userId: "discord_user_id",
  discordAccessToken: "token_here",
  userInfo: {
    username: "username",
    avatar: "avatar_hash",
    email: "email@example.com"
  },
  updatedAt: Date,
  createdAt: Date
}
```

### `server_configs` Collection
```javascript
{
  serverId: "discord_server_id",
  prefix: "!",
  language: "en",
  modRole: "role_id",
  logChannel: "channel_id",
  autorole: true,
  autoroleIds: ["role_id"],
  customCommands: [{
    name: "command_name",
    response: "command_response"
  }],
  updatedAt: Date,
  createdAt: Date
}
```

## 📋 Quick Setup (5 Steps)

### Step 1: Web Dashboard
Add environment variable:
```env
BOT_API_URL=https://api.ziji.world
```

### Step 2: Bot Server Routes
Copy `BOT_SERVER_EXAMPLE.js` to your bot server

### Step 3: Register Routes
In bot server main file:
```javascript
const apiRoutes = require('./routes/api.js');
app.use('/bot', apiRoutes);
```

### Step 4: Create MongoDB Collections
Endpoints will auto-create on first use (with upsert)

### Step 5: Test
```bash
curl https://api.ziji.world/bot/users/123456789/guilds
```

## ✨ Key Improvements

✅ **Centralized Data** - All data managed by bot server
✅ **Security** - Web dashboard no longer needs DB access
✅ **Real-time** - Bot can reload config immediately
✅ **Consistency** - Single source of truth
✅ **Scalability** - Easy to add new features
✅ **Separation of Concerns** - Clear boundaries
✅ **Testing** - Each layer independently testable

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `BOT_API_SETUP_SUMMARY.md` | Quick start guide |
| `BOT_API_ENDPOINTS.md` | Complete API spec |
| `BOT_SERVER_EXAMPLE.js` | Ready-to-use code |
| `MIGRATION_TO_BOT_API.md` | Migration details |
| `API_FLOW_DIAGRAMS.md` | Visual flows |
| `IMPLEMENTATION_CHECKLIST.md` | Step-by-step checklist |
| `lib/bot-api.ts` | Client code |

## 🔍 Data Flow

### Login Flow
1. User clicks "Login with Discord"
2. Discord redirects with auth code
3. Exchange code for Discord token
4. Fetch user & guilds from Discord
5. **POST to bot:** Save session & guilds
6. Create JWT & set cookie
7. Redirect to dashboard

### Load Servers Flow
1. Dashboard: GET `/api/auth/guilds`
2. Web route: Call `getBotUserGuilds()`
3. **Bot API:** GET `/bot/users/:id/guilds`
4. Bot server queries MongoDB
5. Return list of user's servers
6. Dashboard displays servers

### Update Config Flow
1. User modifies config
2. Dashboard: PUT `/api/config`
3. Web route: Verify admin access
4. **Bot API:** POST `/bot/servers/:id/config`
5. Bot server saves to MongoDB
6. Bot reloads configuration
7. Return success response

## ✅ Testing

Quick verification:
```bash
# Test bot server is running
curl https://api.ziji.world/bot/users/test/guilds

# Test web dashboard
npm run dev
# Open http://localhost:3000
# Try Discord login

# Verify API calls in browser DevTools
# Network tab should show requests to /bot/users/*, /bot/servers/*
```

## 🎯 Next Steps

1. **Implement bot server endpoints** - Use `BOT_SERVER_EXAMPLE.js`
2. **Test with curl** - Verify each endpoint works
3. **Deploy bot server** - Push code and restart
4. **Test web dashboard** - Verify full login flow
5. **Deploy web dashboard** - Push to production
6. **Monitor** - Watch logs for errors

## 📞 Support

See these files for detailed help:
- **Questions about API?** → `BOT_API_ENDPOINTS.md`
- **How to implement?** → `BOT_SERVER_EXAMPLE.js`
- **Troubleshooting?** → `IMPLEMENTATION_CHECKLIST.md`
- **Visual flows?** → `API_FLOW_DIAGRAMS.md`
- **Migration details?** → `MIGRATION_TO_BOT_API.md`

## 🎉 Summary

The web dashboard is now **fully decoupled from MongoDB** and communicates exclusively through the bot server's REST API. This provides:

- Better security (no direct DB access from web)
- Real-time updates (bot can reload config immediately)
- Centralized management (bot server controls all data)
- Easier testing (mocked API responses)
- Better scalability (API can be cached, distributed)

All code is ready to use. Just implement the bot server endpoints and deploy!
