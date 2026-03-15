# Bot API Integration Setup Summary

## What Changed

The web dashboard has been fully migrated from direct MongoDB access to communicate through the Ziji-bot-discord server's API endpoints.

### Key Files Created

1. **`/lib/bot-api.ts`** - Bot Server API Client
   - All functions to communicate with bot server
   - Handles all data fetching and updates
   - Entry point for all bot server communication

2. **`BOT_API_ENDPOINTS.md`** - API Specification
   - Complete API endpoint documentation
   - Request/response formats
   - Example implementations
   - Error handling guide

3. **`BOT_SERVER_EXAMPLE.js`** - Ready-to-use Bot Server Routes
   - Copy-paste ready Express.js routes
   - All required endpoints implemented
   - Uses `useHooks.get('db')` for MongoDB access
   - Add to your bot server to enable API

4. **`MIGRATION_TO_BOT_API.md`** - Migration Guide
   - Before/after architecture comparison
   - Files changed and why
   - Troubleshooting guide
   - Testing procedures

### Files Modified

1. **`/app/api/auth/callback/discord/route.ts`**
   - Changed: MongoDB saves → Bot API calls
   - Uses `saveBotUserSession()` and `saveBotUserGuilds()`

2. **`/app/api/auth/guilds/route.ts`**
   - Changed: `getUserGuilds()` → `getBotUserGuilds()`
   - Now fetches from bot server instead of MongoDB

3. **`/app/api/config/route.ts`**
   - Changed: MongoDB access → Bot API calls
   - Uses `getBotServerConfig()`, `updateBotServerConfig()`, `checkBotServerAdmin()`
   - Admin check now uses bot API

### Files Deprecated

- **`/lib/mongodb.ts`** - No longer used in web dashboard
  - Marked as deprecated
  - Kept for reference only
  - Can be safely deleted

## Quick Setup

### Step 1: Web Dashboard Configuration

Add environment variable to `.env.local`:

```env
BOT_API_URL=https://api.ziji.world
```

(Defaults to this if not set)

### Step 2: Bot Server Implementation

Copy `BOT_SERVER_EXAMPLE.js` to your bot server:

```bash
# In your bot server repo
cp BOT_SERVER_EXAMPLE.js ./src/routes/api.js
```

Or manually add these routes to your Express app using the example file as reference.

### Step 3: Register Routes in Bot Server

In your main bot server file (e.g., `src/index.js`):

```javascript
const apiRoutes = require('./routes/api.js');
app.use('/bot', apiRoutes);
```

### Step 4: Enable MongoDB Collections

Your bot server needs these collections in MongoDB:
- `user_guilds` - Stores user's Discord servers list
- `user_discord_sessions` - Stores user Discord access tokens
- `server_configs` - Stores bot configuration per server

These will be created automatically on first use (with MongoDB upsert).

### Step 5: Verify Setup

1. **Test bot server API health:**
   ```bash
   curl https://api.ziji.world/bot/users/123456789/guilds
   ```

2. **Test web dashboard:**
   - Go to `http://localhost:3000`
   - Log in with Discord
   - Verify guilds appear in dashboard

## API Endpoints Required

Your bot server must implement these 7 endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/bot/users/:userId/guilds` | List user's servers |
| POST | `/bot/users/:userId/session` | Save user session |
| POST | `/bot/users/:userId/guilds` | Save user's servers |
| GET | `/bot/users/:userId/servers/:serverId/admin` | Check admin permission |
| GET | `/bot/servers/:serverId/config` | Get server config |
| POST | `/bot/servers/:serverId/config` | Update server config |
| GET | `/bot/servers/:serverId/info` | Get server info |

## Testing Checklist

- [ ] Web dashboard builds without errors
- [ ] Discord OAuth login works
- [ ] User guilds load after login
- [ ] Can view server configuration
- [ ] Can edit and save server configuration
- [ ] Changes saved to bot server MongoDB
- [ ] No direct MongoDB access from web dashboard

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│    Web Dashboard (Next.js)              │
│    /app/api/* routes                    │
└────────────────┬────────────────────────┘
                 │
                 │ HTTP API calls
                 ▼
┌─────────────────────────────────────────┐
│    Bot Server (Express.js)              │
│    /bot/* endpoints                     │
│    - User management                    │
│    - Config management                  │
└────────────────┬────────────────────────┘
                 │
                 │ Database access
                 ▼
┌─────────────────────────────────────────┐
│    MongoDB                              │
│    - user_guilds                        │
│    - user_discord_sessions              │
│    - server_configs                     │
└─────────────────────────────────────────┘
```

## Key Benefits

✅ **Centralized Data** - All data managed by bot server
✅ **Security** - Web dashboard has no direct DB access  
✅ **Real-time** - Bot can reload config immediately
✅ **Scalability** - Easy to add new features on bot server
✅ **Maintainability** - Single source of truth

## Troubleshooting

### "Bot API error: 500"
- Check bot server is running
- Verify MongoDB connection works
- Check API endpoint is implemented

### "User guilds not loading"
- Verify `/bot/users/:userId/guilds` endpoint works
- Check user session was saved
- Look at bot server logs

### "Config not saving"
- Verify `/bot/servers/:serverId/config` POST endpoint
- Check user has admin permission
- Verify MongoDB write permissions

## Next Steps

1. Implement the bot server routes from `BOT_SERVER_EXAMPLE.js`
2. Test API endpoints with curl
3. Deploy to production
4. Monitor bot server logs for API errors

## Support & Documentation

- **API Details:** See `BOT_API_ENDPOINTS.md`
- **Migration Info:** See `MIGRATION_TO_BOT_API.md`
- **Example Routes:** See `BOT_SERVER_EXAMPLE.js`
- **Client Code:** See `/lib/bot-api.ts`

## Questions?

Refer to:
1. `BOT_API_ENDPOINTS.md` - For API spec and examples
2. `BOT_SERVER_EXAMPLE.js` - For implementation reference
3. `MIGRATION_TO_BOT_API.md` - For troubleshooting
